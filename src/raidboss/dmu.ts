{
  interface Data extends RaidbossData {
    etnTeleportBuffs: TeleportBuffs[];
  }

  interface TeleportBuffs {
    duration: number;
    effectId: string;
  }

  const TELEPORT_BUFFS = [
    // ↑, ↓, →, ←
    // Low priority
    "4876",
    "4877",
    "4878",
    "4879",
    // High priority
    "5079",
    "5080",
    "5081",
    "5082",
  ];

  const triggerSet: TriggerSet<Data> = {
    id: "EtnDMUAddonsForSouma",
    zoneId: ZoneId.DancingMadUltimate,
    initData: () => ({
      etnTeleportBuffs: [],
    }),
    triggers: [
      {
        id: "EtnDMU Teleport",
        type: "GainsEffect",
        netRegex: { effectId: TELEPORT_BUFFS, capture: true },
        condition: Conditions.targetIsYou(),
        infoText: (data, matches) => {
          data.etnTeleportBuffs.push({
            duration: parseFloat(matches.duration),
            effectId: matches.effectId,
          });
          if (data.etnTeleportBuffs.length !== 2) {
            return;
          }

          let [buff1, buff2] = data.etnTeleportBuffs;
          if (!buff1 || !buff2) {
            return;
          }

          if (buff1.effectId < buff2.effectId) {
            [buff1, buff2] = [buff2, buff1];
          }

          const mainDir = TELEPORT_BUFFS.indexOf(buff1.effectId) - 4;
          const subDir = TELEPORT_BUFFS.indexOf(buff2.effectId);

          if (mainDir === subDir) {
            switch (mainDir) {
              case 0:
                return "Bird 然后 Bird 3";
              case 1:
                return "Dog 然后 Dog 1";
              case 2:
                return "C 然后 C 4";
              case 3:
                return "A 然后 A 2";
            }
          }

          if (buff1.duration < buff2.duration) {
            switch (mainDir) {
              case 0:
                return "2 然后 2 Bird";
              case 1:
                return "4 然后 4 Dog";
              case 2:
                return "3 然后 3  C";
              case 3:
                return "1 然后 1 A";
            }
          } else {
            switch (mainDir) {
              case 0:
                return "Bird 2 然后 2";
              case 1:
                return "Dog 4 然后 4";
              case 2:
                return "C3 然后 3";
              case 3:
                return "A1 然后 1";
            }
          }
        },
      },
    ],
  };

  Options.Triggers.push(triggerSet as LooseTriggerSet);
}
