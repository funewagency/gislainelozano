import { C } from '@/components/gislaine/constants';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep, totalSteps, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isCompleted = completedSteps.includes(step);
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-2 transition-colors"
              style={{
                backgroundColor: isActive ? C.primary : isCompleted ? C.accent : C.inactive,
                color: isActive || isCompleted ? C.white : C.muted,
              }}
            >
              {isCompleted ? '✓' : step}
            </div>
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color: isActive ? C.primary : C.muted }}
            >
              {['Início', 'GA4', 'Pixel', 'Ads', 'Revisão'][step - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
