import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export default function SkeletonVideo() {
    return (
        <Item variant="outline" role="listitem">
            <ItemMedia variant="image">
                <Skeleton className="w-10 h-10 rounded-lg"/>
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="line-clamp-1 w-full mt-[3.25px]">
                    <Skeleton className="h-4 max-w-96"/>
                </ItemTitle>
                <ItemDescription>
                    <Skeleton className="h-4 w-20"/>
                </ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <ItemDescription>
                    <Skeleton className="w-8 h-4" />
                </ItemDescription>
            </ItemContent>
            <Skeleton className="w-full h-3"/>
        </Item>
    );
}