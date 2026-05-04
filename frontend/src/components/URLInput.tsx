import { HugeiconsIcon } from "@hugeicons/react"

import {
    InputGroup,
    InputGroupAddon, InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {Search01Icon} from "@hugeicons/core-free-icons";

export function URLInput() {
    return (
        <InputGroup>
            <InputGroupInput
                id="inline-end-input"
                type="url"
                placeholder="Youtube Video/Playlist"
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton>
                    <HugeiconsIcon icon={Search01Icon}/>
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}
