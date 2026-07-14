{
  // --- 静态数据与类型定义 ---

  // 通用工具

  const pick = <V>(
    r: Record<string, V>,
    predict: (key: string, value: V) => boolean,
  ): Record<string, V> => {
    const result: Record<string, V> = {};
    for (const key in r) {
      if (r[key] && predict(key, r[key])) {
        result[key] = r[key];
      }
    }
    return result;
  };

  // 优先级工具

  const JobPriority: Job[] = [
    "WAR",
    "PLD",
    "DRK",
    "GNB",

    "WHM",
    "AST",
    "SGE",
    "SCH",

    "VPR",
    "SAM",
    "NIN",
    "RPR",
    "DRG",
    "MNK",

    "DNC",
    "BRD",
    "MCH",

    "BLM",
    "PCT",
    "RDM",
    "SMN",
  ];
  const jobPriority = (job: Job): number => JobPriority.indexOf(job);

  // P1 神像3 传送 Buff

  // 两个相同 Buff，或异种 Buff 的第一个
  // 顺序：↑, ↓, →, ←
  const TELEPORT_BUFFS_MAIN = ["130C", "130D", "130E", "130F"];
  // 仅用于异种 Buff 的第二个
  const TELEPORT_BUFFS_SUB = ["13D7", "13D8", "13D9", "13DA"];
  const TELEPORT_BUFFS = [...TELEPORT_BUFFS_MAIN, ...TELEPORT_BUFFS_SUB];

  // P2 八连塔头标

  type P2HeadMarkerId = "02CB" | "02CC" | "02CD";
  const P2_HEAD_MARKERS = {
    "02CB": "分摊",
    "02CC": "钢铁",
    "02CD": "扇形",
  } as const;
  const P2_HEAD_MARKER_IDS = Object.keys(P2_HEAD_MARKERS) as P2HeadMarkerId[];
  const isP2HeadMarkerId = (id: string): id is P2HeadMarkerId => {
    return P2_HEAD_MARKER_IDS.includes(id as P2HeadMarkerId);
  };
  const getP2FirstTowerPartner = (
    data: Data,
    player: string,
  ): string | undefined => {
    if (data.etnP2TowerCurrentTurn === 1 || data.etnP2TowerCurrentTurn === 4) {
      const partyListSorted = [...data.party.partyNames].sort(
        (a, b) =>
          jobPriority(data.party.jobName(a) ?? "NONE") -
          jobPriority(data.party.jobName(b) ?? "NONE"),
      );
      // MT/H1 ST/H2 D1/D3 D2/D4
      const pairs = {
        0: 2,
        1: 3,
        2: 0,
        3: 1,
        4: 6,
        5: 7,
        6: 4,
        7: 5,
      };
      const myIndex = partyListSorted.indexOf(player);
      if (myIndex < 0 || myIndex > 7) {
        console.error("未找到自己:", myIndex, player, partyListSorted);
        return;
      }

      const partner = partyListSorted[pairs[myIndex as keyof typeof pairs]];
      if (!partner) {
        console.error("未找到队友:", player, partyListSorted);
        return;
      }

      return partner;
    }
  };
  interface Position {
    x: number;
    y: number;
  }
  // 顺时针排序
  const p2TowerSortPosition = (
    positions: Record<string, Position>,
  ): string[] => {
    const center: Position = { x: 100, y: 100 };
    const fullCircle = Math.PI * 2;

    const items = Object.entries(positions)
      .map(([key, position]) => {
        const dx = position.x - center.x;
        const dy = position.y - center.y;

        const angle = (Math.atan2(dx, -dy) + fullCircle) % fullCircle;

        return {
          key,
          angle,
          distanceSquared: dx ** 2 + dy ** 2,
        };
      })
      .sort(
        (a, b) => a.angle - b.angle || a.distanceSquared - b.distanceSquared,
      );

    if (items.length <= 1) return items.map((item) => item.key);

    // 寻找相邻点之间最大的角度空隙
    let largestGap = -1;
    let startIndex = 0;

    for (let i = 0; i < items.length; i++) {
      const nextIndex = (i + 1) % items.length;

      const currentAngle = items[i]!.angle;
      const nextAngle =
        items[nextIndex]!.angle + (nextIndex === 0 ? fullCircle : 0);

      const gap = nextAngle - currentAngle;

      if (gap > largestGap) {
        largestGap = gap;
        startIndex = nextIndex;
      }
    }

    return [...items.slice(startIndex), ...items.slice(0, startIndex)].map(
      (item) => item.key,
    );
  };
  const p2TowerAlertText = (data: Data) => {
    let partner: string = "";
    let myMarker: string = "";
    let partnerMarker: string = "";

    if (data.etnP2TowerCurrentTurn === 1 || data.etnP2TowerCurrentTurn === 4) {
      partner = getP2FirstTowerPartner(data, data.me) ?? "";
      if (!partner) return;

      myMarker = data.etnP2HeadMarkers[data.me] ?? "";
      partnerMarker = data.etnP2HeadMarkers[partner] ?? "";
      if (!myMarker || !partnerMarker) {
        console.error(
          "未找到我的或同组的头标:",
          data.me,
          partner,
          data.etnP2HeadMarkers,
        );
        return;
      }
    } else {
      myMarker = data.etnP2HeadMarkers[data.me] ?? "";
      if (!myMarker) {
        console.error("未找到我头标:", data.me, data.etnP2HeadMarkers);
        return;
      }
      for (const player of data.etnP2TowerTeam) {
        if (player === data.me) continue;

        const playerMarker = data.etnP2HeadMarkers[player] ?? "";
        if (!playerMarker) {
          console.error("未找到头标:", player, data.etnP2HeadMarkers);
          return;
        }
        if (myMarker === playerMarker) {
          partner = player;
          partnerMarker = playerMarker;
          break;
        }
      }
    }

    // 第一轮 确定 1238/4567 组和组内队友
    if (data.etnP2TowerCurrentTurn === 1) {
      for (const [player, playerMarkerId] of Object.entries(
        data.etnP2HeadMarkers,
      )) {
        if (player === data.me || player === partner) {
          continue;
        }

        const playerPartner = getP2FirstTowerPartner(data, player);
        if (!playerPartner) {
          console.error("未找到同组:", player, data.etnP2HeadMarkers);
          return;
        }
        const playerPartnerMarker = data.etnP2HeadMarkers[playerPartner];
        if (!playerPartnerMarker) {
          console.error(
            "未找到同组的头标:",
            playerPartner,
            data.etnP2HeadMarkers,
          );
          return;
        }

        if (myMarker !== partnerMarker) {
          // 1238
          if (playerPartnerMarker !== playerMarkerId) {
            data.etnP2TowerTeam = [data.me, partner, player, playerPartner];
            data.etnP2TowerMyTurns = [1, 2, 3, 8];
            break;
          }
        } else {
          // 4567
          if (playerPartnerMarker === playerMarkerId) {
            data.etnP2TowerTeam = [data.me, partner, player, playerPartner];
            data.etnP2TowerMyTurns = [4, 5, 6, 7];
            break;
          }
        }
      }
    }

    if (data.etnP2TowerMyTurns.length !== 4) {
      console.error("未能成功分组:", data.etnP2HeadMarkers);
      return;
    }

    if (!data.etnP2TowerMyTurns.includes(data.etnP2TowerCurrentTurn)) {
      const basePrompt = `${data.etnP2TowerCurrentTurn}轮闲人，`;
      if (data.etnP2TowerCurrentTurn % 2 !== 0) {
        return `${basePrompt}塔外处理`;
      } else {
        return `${basePrompt}分散引导踩头`;
      }
    }

    let leftOrRightTower = "";
    let leftOrRight = "";
    if (data.etnP2TowerCurrentTurn === 1) {
      if (myMarker === "02CC" || partnerMarker === "02CC") {
        leftOrRightTower = "右→";
      }

      if (myMarker === "02CD" || partnerMarker === "02CD") {
        leftOrRightTower = "左←";
      }
    } else if (data.etnP2TowerCurrentTurn === 4) {
      leftOrRight =
        jobPriority(data.party.jobName(data.me) ?? "NONE") <
        jobPriority(data.party.jobName(partner) ?? "NONE")
          ? "左←"
          : "右→";
    } else {
      const playersInMyTeam = pick(data.etnP2Positions, (key) =>
        data.etnP2TowerTeam.includes(key),
      );
      const sortedPlayers = p2TowerSortPosition(playersInMyTeam);
      leftOrRight =
        sortedPlayers.indexOf(data.me) > sortedPlayers.indexOf(partner)
          ? "左←"
          : "右→";
      leftOrRightTower = leftOrRight;
    }

    const basePrompt = `${data.etnP2TowerCurrentTurn}轮踩塔，踩`;
    if (data.etnP2TowerCurrentTurn % 2 !== 0) {
      if (myMarker === "02CB")
        return basePrompt + `${leftOrRightTower}塔${leftOrRightTower}分摊`;
      if (myMarker === "02CC") return basePrompt + `右→塔左←钢铁`;
      if (myMarker === "02CD") return basePrompt + `左←塔下↓扇形`;
    } else {
      if (myMarker === "02CB")
        console.error(
          "偶数轮不应有分摊:",
          data.etnP2TowerTeam,
          data.etnP2HeadMarkers,
        );
      if (myMarker === "02CC") return basePrompt + `右→塔${leftOrRight}钢铁`;
      if (myMarker === "02CD") return basePrompt + `左←塔${leftOrRight}扇形`;
    }
  };

  // Data 类型定义

  interface Data extends RaidbossData {
    etnTeleportBuffs: TeleportBuffs[];
    // 维护当前：玩家 -> 头标
    etnP2HeadMarkers: Record<string, P2HeadMarkerId>;
    etnP2Positions: Record<string, Position>;
    etnP2TowerCurrentTurn: number;
    etnP2TowerMyTurns: number[];
    etnP2TowerTeam: string[];
  }

  interface TeleportBuffs {
    duration: number;
    effectId: string;
  }

  interface Position {
    x: number;
    y: number;
  }

  // --- 触发器开始 ---

  const triggerSet: TriggerSet<Data> = {
    id: "EtnDMUAddonsForSouma",
    zoneId: ZoneId.DancingMadUltimate,
    initData: () => ({
      etnTeleportBuffs: [],
      etnP2HeadMarkers: {},
      etnP2Positions: {},
      etnP2TowerCurrentTurn: 1,
      etnP2TowerMyTurns: [],
      etnP2TowerTeam: [],
    }),
    triggers: [
      // Override
      {
        id: "DMU P1 神像3",
        type: "GainsEffect",
        netRegex: { effectId: TELEPORT_BUFFS, capture: true },
        condition: Conditions.targetIsYou(),
        durationSeconds: 10,
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
            console.error(
              "两个 Buff 都不是主 Buff:",
              buff1.effectId,
              buff2.effectId,
            );
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
      {
        id: "DMU P2 HM判",
        type: "HeadMarker",
        netRegex: { id: "__DISABLED__" }
      },
      {
        id: "DMU P2 没事干了",
        type: "HeadMarker",
        netRegex: { id: "__DISABLED__" }
      },
      {
        id: "EtnDMU P2 HeadMarker Collector",
        type: "HeadMarker",
        netRegex: { id: P2_HEAD_MARKER_IDS, capture: true },
        run: (data, matches) => {
          if (isP2HeadMarkerId(matches.id)) {
            data.etnP2HeadMarkers[matches.target] = matches.id;
          }
        },
      },
      {
        id: "EtnDMU P2 Tower Turns Counter",
        type: "Ability",
        netRegex: { id: "BABE" },
        run: (data) => data.etnP2TowerCurrentTurn++,
        suppressSeconds: 1,
      },
      {
        id: "EtnDMU P2 Tower Player Position Collctor",
        type: "Ability",
        netRegex: { id: "BABE", capture: true },
        run: (data, matches) => {
          data.etnP2Positions[matches.target] = {
            x: parseFloat(matches.targetX),
            y: parseFloat(matches.targetY),
          };
        },
      },
      {
        id: "EtnDMU P2 Tower 1-7 TTS",
        type: "HeadMarker",
        netRegex: { id: P2_HEAD_MARKER_IDS },
        condition: (data) => data.etnP2TowerCurrentTurn < 8,
        delaySeconds: (data) => [3, 5, 7].includes(data.etnP2TowerCurrentTurn) ? 5 : 0.3,
        suppressSeconds: 1,
        alertText: p2TowerAlertText,
        durationSeconds: 10,
      },
      {
        id: "EtnDMU P2 Tower 8 TTS",
        type: "Ability",
        netRegex: { id: "BABE" },
        condition: (data) => data.etnP2TowerCurrentTurn === 8,
        delaySeconds: 0.3,
        suppressSeconds: 1,
        alertText: p2TowerAlertText,
        durationSeconds: 10,
      },
    ],
  };

  Options.Triggers.push(triggerSet as LooseTriggerSet);
}
