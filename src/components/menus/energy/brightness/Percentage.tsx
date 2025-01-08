import { bind } from 'astal';
import { Gtk } from 'astal/gtk3';
import { brightnessService } from 'src/lib/constants/services';

interface BrightnessPercentageProps {
    device: string;
}

export const BrightnessPercentage = ({ device }: BrightnessPercentageProps): JSX.Element => {
    return (
        <label
            className={'brightness-slider-label'}
            label={bind(brightnessService, 'screens').as((screens) => {
                const screen = screens.find((s) => s.device === device);
                return `${Math.round((screen?.current || 0) * 100)}%`;
            })}
            valign={Gtk.Align.CENTER}
            vexpand
        />
    );
};
