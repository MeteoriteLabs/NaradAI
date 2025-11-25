import Joyride, { CallBackProps, STATUS, EVENTS, Step } from "react-joyride";

interface JoyrideFlowWrapperProps {
  steps: Step[];
  onFlowComplete: () => void;
  onStepChange: (index: number) => void;
  run: boolean;
}

export function JoyrideFlowWrapper({
  steps,
  onFlowComplete,
  onStepChange,
  run,
}: JoyrideFlowWrapperProps) {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (type === EVENTS.STEP_AFTER) {
      onStepChange(index + 1);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onFlowComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        buttonNext: {
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          borderRadius: 6,
          padding: "8px 16px",
        },
      }}
    />
  );
}
