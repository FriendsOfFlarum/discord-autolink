/**
 * The invite card data served by GET /api/discord/invites/{code}.
 */
export interface DiscordInvite {
    code: string;
    url: string;
    guild: {
        id: string | null;
        name: string | null;
        description: string | null;
        iconUrl: string | null;
        memberCount: number | null;
        onlineCount: number | null;
        verified: boolean;
        partnered: boolean;
    };
    channel: {
        name: string;
    } | null;
    event: DiscordEvent | null;
}
export interface DiscordEvent {
    id: string;
    name: string | null;
    description: string | null;
    startsAt: string | null;
    endsAt: string | null;
    status: 'scheduled' | 'active' | 'completed' | 'canceled' | null;
    interestedCount: number | null;
    imageUrl: string | null;
    channelName: string | null;
}
