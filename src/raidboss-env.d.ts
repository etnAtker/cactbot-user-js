declare const Options: import('../cactbot/ui/raidboss/raidboss_options').RaidbossOptions;
declare const Conditions: typeof import('../cactbot/resources/conditions').default;
declare const ContentType: typeof import('../cactbot/resources/content_type').default;
declare const NetRegexes: typeof import('../cactbot/resources/netregexes').default;
declare const Regexes: typeof import('../cactbot/resources/regexes').default;
declare const Responses: typeof import('../cactbot/resources/responses').Responses;
declare const Outputs: typeof import('../cactbot/resources/outputs').default;
declare const Util: typeof import('../cactbot/resources/util').default;
declare const Directions: typeof import('../cactbot/resources/util').Directions;
declare const ZoneId: typeof import('../cactbot/resources/zone_id').default;
declare const ZoneInfo: typeof import('../cactbot/resources/zone_info').default;

type RaidbossData = import('../cactbot/types/data').RaidbossData;
type LooseTriggerSet = import('../cactbot/types/trigger').LooseTriggerSet;
type TriggerSet<Data extends RaidbossData = RaidbossData> =
  import('../cactbot/types/trigger').TriggerSet<Data>;

