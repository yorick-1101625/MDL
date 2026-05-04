import { HugeiconsIcon } from "@hugeicons/react"

import {
    InputGroup,
    InputGroupAddon, InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {Search01Icon} from "@hugeicons/core-free-icons";
import {type Ref} from "react";

type URLInputProps = {
    ref?: Ref<HTMLInputElement>,
    onSubmit?: () => void,
}

export function URLInput({ref, onSubmit}: URLInputProps) {

    return (
        <InputGroup>
            <InputGroupInput
                id="inline-end-input"
                type="url"
                placeholder="Youtube Video/Playlist"
                ref={ ref }
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => onSubmit && onSubmit()} >
                    <HugeiconsIcon icon={Search01Icon}/>
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}
