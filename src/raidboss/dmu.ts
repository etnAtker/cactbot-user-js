{
  interface Data extends RaidbossData {
    etnTeleportBuffs: TeleportBuffs[];
  }

  interface TeleportBuffs {
    duration: number;
    effectId: string;
  }

  // 两个相同 Buff，或异种 Buff 的第一个
  // 顺序：↑, ↓, →, ←
  const TELEPORT_BUFFS_MAIN = [
    "130C",
    "130D",
    "130E",
    "130F",
  ];
  // 仅用于异种 Buff 的第二个
  const TELEPORT_BUFFS_SUB = [
    "13D7",
    "13D8",
    "13D9",
    "13DA",
  ];

  const TELEPORT_BUFFS = [
    ...TELEPORT_BUFFS_MAIN,
    ...TELEPORT_BUFFS_SUB,
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

          console.log(data.me, data.etnTeleportBuffs);
          const [buff1, buff2] = data.etnTeleportBuffs;
          if (!buff1 || !buff2) {
            console.error("传送 Buff 为空:", data.etnTeleportBuffs);
            return;
          }

          if (buff1.effectId === buff2.effectId) {
            switch (buff1.effectId) {
              case "130C":
                return "Bird 然后 Bird 3";
              case "130D":
                return "Dog 然后 Dog 1";
              case "130E":
                return "C 然后 C4";
              case "130F":
                return "A 然后 A2";
            }
          }

          let mainDir = TELEPORT_BUFFS_MAIN.indexOf(buff1.effectId);
          let mainDuration = buff1.duration;
          if (mainDir === -1) {
            mainDir = TELEPORT_BUFFS_MAIN.indexOf(buff2.effectId);
            mainDuration = buff2.duration;
          }
          if (mainDir === -1) {
            console.error("两个 Buff 都不是主 Buff:", buff1.effectId, buff2.effectId);
            return;
          }

          if (mainDuration < 9) {
            switch (mainDir) {
              case 0:
                return "3 然后 3C";
              case 1:
                return "1 然后 1A";
              case 2:
                return "4 然后 4 Dog";
              case 3:
                return "2 然后 2 Bird";
            }
          } else {
            switch (mainDir) {
              case 0:
                return "C3 然后 3";
              case 1:
                return "A1 然后 1";
              case 2:
                return "Dog 4 然后 4";
              case 3:
                return "Bird 2 然后 2";
            }
          }
        },
      },
    ],
  };

  Options.Triggers.push(triggerSet as LooseTriggerSet);
}
