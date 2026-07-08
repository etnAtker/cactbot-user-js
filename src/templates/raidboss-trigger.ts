// Copy this file into src/raidboss/ and rename it for a real trigger file.
// Files in templates/ are examples only and are not compiled.

{
  interface Data extends RaidbossData {}

  const triggerSet: TriggerSet<Data> = {
    id: "UserAacLightHeavyweightM1Savage",
    zoneId: ZoneId.AacLightHeavyweightM1Savage,
    initData: () => ({}),
    triggers: [
      {
        id: "User Template Example Trigger",
        type: "StartsUsing",
        netRegex: { id: "9495", source: "Black Cat", capture: true },
        response: Responses.tankBuster(),
      },
    ],
  };

  Options.Triggers.push(triggerSet as LooseTriggerSet);
}
