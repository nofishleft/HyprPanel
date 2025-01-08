import { Gtk } from 'astal/gtk3';
import { BrightnessHeader } from './Header';
import { BrightnessIcon } from './Icon';
import { BrightnessSlider } from './Slider';
import { BrightnessPercentage } from './Percentage';
import { brightnessService } from 'src/lib/constants/services';

const BrightnessControl = ({ device }: { device: string }): JSX.Element => {
    return (
        <box className={'brightness-container'}>
            <BrightnessIcon />
            <BrightnessSlider device={device} />
            <BrightnessPercentage device={device} />
        </box>
    );
};

const Brightness = (): JSX.Element => {
    const devices = brightnessService.getScreenDevices();

    return (
        <box className={'menu-section-container brightness'} vertical>
            <BrightnessHeader />
            <box className={'menu-items-section'} valign={Gtk.Align.FILL} vexpand vertical>
                {devices.map((device) => (
                    <BrightnessControl key={device} device={device} />
                ))}
            </box>
        </box>
    );
};

export { Brightness };
