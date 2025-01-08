import { bind } from 'astal';
import { Gtk } from 'astal/gtk3';
import { brightnessService } from 'src/lib/constants/services';

interface BrightnessSliderProps {
    device: string;
}

export const BrightnessSlider = ({ device }: BrightnessSliderProps): JSX.Element => {
    return (
        <slider
            className={'menu-active-slider menu-slider brightness'}
            value={bind(brightnessService, 'screens').as((screens) => {
                const screen = screens.find((s) => s.device === device);
                return screen?.current || 0;
            })}
            onDragged={({ value, dragging }) => {
                if (dragging) {
                    brightnessService.setScreenBrightness(device, value);
                }
            }}
            valign={Gtk.Align.CENTER}
            drawValue={false}
            expand
            min={0}
            max={1}
        />
    );
};
