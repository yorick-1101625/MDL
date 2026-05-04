import Song from "@/components/Song.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import {URLInput} from "@/components/URLInput.tsx";

export default function App() {
    return (
        <div>
            <URLInput/>
            <ItemGroup>
                <Song/>
                <Song/>
            </ItemGroup>
        </div>
    );
}