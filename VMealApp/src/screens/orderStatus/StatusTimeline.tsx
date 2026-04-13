import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface TimelineStep {
  label: string;
  time: string | null;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <View>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <View key={step.label} className="flex-row gap-3">
            {/* Dot column */}
            <View className="items-center">
              {/* Dot */}
              {step.status === 'COMPLETED' ? (
                <View className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#10B981]">
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : step.status === 'ACTIVE' ? (
                <View className="relative flex h-[24px] w-[24px] items-center justify-center">
                  <View className="absolute h-[24px] w-[24px] rounded-full bg-[#3B82F6]/30" />
                  <View className="relative h-[12px] w-[12px] rounded-full bg-[#3B82F6]" />
                </View>
              ) : (
                <View className="flex h-[24px] w-[24px] items-center justify-center">
                  <View className="h-[12px] w-[12px] rounded-full border-2 border-gray-200 bg-white" />
                </View>
              )}

              {/* Line */}
              {!isLast && (
                <View
                  className={`w-[2px] flex-1 min-h-[32px] ${
                    step.status === 'COMPLETED' ? 'bg-[#10B981]' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>

            {/* Content */}
            <View className={isLast ? 'pb-0' : 'pb-4'}>
              <Text
                className={`text-[14px] font-medium ${
                  step.status === 'COMPLETED'
                    ? 'text-[#10B981]'
                    : step.status === 'ACTIVE'
                      ? 'text-[#3B82F6]'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className="text-[12px] text-gray-400">{step.time}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
