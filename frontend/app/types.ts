// app/types.ts
export interface Video {
    _id: string;
    title: string;
    description: string;
    thumbnail: {
        url: string;
    };
    ownerDetails: {
        username: string;
        avatar: {
            url: string;
        };
    };
    views: number;
    createdAt: string;
}