import { exec, GObject, monitorFile, property, readFileAsync, register } from 'astal';
import { sh } from 'src/lib/utils';

interface Screen {
    device: string;
    max: number;
    current: number;
    path: string;
}

const get = (args: string): number => Number(exec(`brightnessctl ${args}`));
const kbd = exec(`bash -c "ls -w1 /sys/class/leds | grep '::kbd_backlight$' | head -1"`);

@register({ GTypeName: 'Brightness' })
export default class Brightness extends GObject.Object {
    static instance: Brightness;
    static get_default(): Brightness {
        if (!Brightness.instance) {
            Brightness.instance = new Brightness();
        }
        return Brightness.instance;
    }

    // Get all available screens
    #screens: Screen[] = exec(`bash -c "ls -w1 /sys/class/backlight"`)
        .split('\n')
        .filter(Boolean)
        .map((device) => ({
            device,
            max: get(`--device ${device} max`),
            current: get(`--device ${device} get`),
            path: `/sys/class/backlight/${device}/brightness`,
        }));

    #kbdMax = kbd?.length ? get(`--device ${kbd} max`) : 0;
    #kbd = kbd?.length ? get(`--device ${kbd} get`) : 0;

    @property(Number)
    get kbd(): number {
        return this.#kbd;
    }

    @property(Array)
    get screens(): Screen[] {
        return this.#screens.map((screen) => ({
            device: screen.device,
            current: screen.current / (screen.max || 1),
            max: screen.max,
            path: screen.path,
        }));
    }

    // Get brightness for a specific screen
    getScreenBrightness(device: string): number {
        const screen = this.#screens.find((s) => s.device === device);
        if (!screen) return 0;
        return screen.current / (screen.max || 1);
    }

    set kbd(value: number) {
        if (value < 0 || value > this.#kbdMax || !kbd?.length) return;
        sh(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
            this.#kbd = value;
            this.notify('kbd');
        });
    }

    // Set brightness for a specific screen by device name
    async setScreenBrightness(device: string, percent: number): Promise<void> {
        const screen = this.#screens.find((s) => s.device === device);
        if (!screen) return;

        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;

        const percentage = `${Math.round(percent * 100)}%`;

        try {
            await sh(`brightnessctl set ${percentage} -d ${screen.device} -q`);
            screen.current = Math.round(percent * screen.max);
            this.notify('screens');
        } catch (error) {
            console.error(`Failed to set brightness for device ${device}:`, error);
        }
    }

    // Get list of available screen devices
    getScreenDevices(): string[] {
        return this.#screens.map((screen) => screen.device);
    }

    constructor() {
        super();

        // Monitor all screens for changes
        this.#screens.forEach((screen) => {
            monitorFile(screen.path, async (f) => {
                try {
                    const v = await readFileAsync(f);
                    screen.current = Number(v);
                    this.notify('screens');
                } catch (error) {
                    console.error(`Failed to read brightness for ${screen.device}:`, error);
                }
            });
        });

        // Monitor keyboard backlight
        if (kbd?.length) {
            const kbdPath = `/sys/class/leds/${kbd}/brightness`;
            monitorFile(kbdPath, async (f) => {
                const v = await readFileAsync(f);
                this.#kbd = Number(v);
                this.notify('kbd');
            });
        }
    }
}
