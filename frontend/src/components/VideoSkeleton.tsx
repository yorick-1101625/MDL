import {Item, ItemContent, ItemMedia} from "@/components/ui/item.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export default function VideoSkeleton() {
    return (
        <Item variant="outline" role="listitem">
            <ItemMedia variant="image">
                <Skeleton className="w-10 h-10 rounded-lg"/>
            </ItemMedia>
            <ItemContent>
                <Skeleton className="h-4 max-w-96 mt-[3.25px]"/>
                <Skeleton className="h-4 w-20 "/>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <Skeleton className="w-8 h-4" />
            </ItemContent>
            <Skeleton className="w-full h-3"/>
        </Item>
    );
}