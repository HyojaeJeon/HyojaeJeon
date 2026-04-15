import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, typography, spacing } from '@shared/ui/tokens';

interface TimelineStep {
  label: string;
  time: string | null;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

const DOT_SIZE = 24;
const INNER_DOT_SIZE = 12;

/** Pulsing ring around the active timeline dot. */
function PulsingDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View className="relative flex items-center justify-center" style={{ height: DOT_SIZE, width: DOT_SIZE }}>
      <Animated.View
        className="absolute"
        style={{ height: DOT_SIZE, width: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: `${colors.primary}4D`, opacity: pulseAnim }}
      />
      <View className="relative" style={{ height: INNER_DOT_SIZE, width: INNER_DOT_SIZE, borderRadius: INNER_DOT_SIZE / 2, backgroundColor: colors.primary }} />
    </View>
  );
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  const stepLabelColor = (status: TimelineStep['status']) => {
    if (status === 'COMPLETED') return colors.success;
    if (status === 'ACTIVE') return colors.primary;
    return colors.textTertiary;
  };

  return (
    <View>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <View key={step.label} className="flex-row" style={{ gap: spacing.elementGap }}>
            {/* Dot column */}
            <View className="items-center">
              {/* Dot */}
              {step.status === 'COMPLETED' ? (
                <View className="flex items-center justify-center" style={{ height: DOT_SIZE, width: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: colors.success }}>
                  <Check size={14} color={colors.textInverse} strokeWidth={3} />
                </View>
              ) : step.status === 'ACTIVE' ? (
                <PulsingDot />
              ) : (
                <View className="flex items-center justify-center" style={{ height: DOT_SIZE, width: DOT_SIZE }}>
                  <View style={{ height: INNER_DOT_SIZE, width: INNER_DOT_SIZE, borderRadius: INNER_DOT_SIZE / 2, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bgWhite }} />
                </View>
              )}

              {/* Line */}
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 32,
                    backgroundColor: step.status === 'COMPLETED' ? colors.success : colors.border,
                  }}
                />
              )}
            </View>

            {/* Content */}
            <View style={{ paddingBottom: isLast ? 0 : spacing.lg }}>
              <Text
                style={{
                  ...typography.body,
                  fontWeight: '500',
                  color: stepLabelColor(step.status),
                }}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text style={typography.caption}>{step.time}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
