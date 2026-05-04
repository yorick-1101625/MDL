import {Progress} from "@/components/ui/progress.tsx";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item.tsx";

export default function Song() {
    return (
        <Item variant="outline" role="listitem">
            <ItemMedia variant="image">
                <img
                    src="https://i.ytimg.com/vi/_nypMwCyNEQ/sddefault.jpg"
                    alt="Forever"
                    width={32}
                    height={32}
                    className="object-cover"
                />
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="line-clamp-1">
                    Forever
                </ItemTitle>
                <ItemDescription>ILLENIUM</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <ItemDescription>2:52</ItemDescription>
            </ItemContent>
            <Progress value={50}/>
        </Item>
    );
}