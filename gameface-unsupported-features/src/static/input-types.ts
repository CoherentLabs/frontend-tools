/**
 * Canonical list of <input> type values to probe.
 *
 * For each type the probe checks:
 *   1. Does el.type round-trip? (set → read back)
 *   2. Do type-specific APIs work? (valueAsNumber, checked, files …)
 *
 * Gameface silently coerces unsupported types to "text".
 * The probe detects this and labels the entry "silently-coerced".
 */
export const INPUT_TYPES: string[] = [
    'button',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
];
