import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class EmojiCache extends BaseCache<import("@amanda/discordtypings").EmojiData> {
    namespace: "emoji";
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, boundObject?: import("@amanda/discordtypings").EmojiData);
    get(id: string, guildId?: string | undefined): Promise<EmojiCache | null>;
    update(id: string, guildId: string | undefined, data: import("@amanda/discordtypings").EmojiData): Promise<EmojiCache>;
    remove(id: string, guildId?: string | undefined): Promise<void>;
    filter(fn: (emoji?: import("@amanda/discordtypings").EmojiData, index?: number, array?: Array<import("@amanda/discordtypings").EmojiData>) => unknown, guildId: string | undefined, ids?: Array<string> | undefined): Promise<Array<EmojiCache>>;
    find(fn: (emoji?: import("@amanda/discordtypings").EmojiData, index?: number, array?: Array<string>) => unknown, guildId: string, ids: Array<string> | undefined): Promise<EmojiCache | null>;
    buildId(emojiId: string, guildId?: string): string;
}
export = EmojiCache;
