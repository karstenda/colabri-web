import {
  ControlButton,
  ControlsBar,
  ControlsBox,
} from './DocEditorBlockStyles';

export type DocEditorBlockControl = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export type DocEditorBlockControlsProps = {
  show: boolean;
  controls: DocEditorBlockControl[];
};

const DocEditorBlockControls = ({
  controls,
  show,
}: DocEditorBlockControlsProps) => {
  if (!show) {
    return <></>;
  } else {
    return (
      <ControlsBox>
        <ControlsBar>
          {controls.map((control) => {
            return (
              <ControlButton
                key={control.id}
                size="small"
                onClick={control.onClick}
              >
                {control.icon}
              </ControlButton>
            );
          })}
        </ControlsBar>
      </ControlsBox>
    );
  }
};

export default DocEditorBlockControls;
