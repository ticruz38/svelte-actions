var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { tick } from "svelte";
export function virtualscroll(node, options) {
    let top;
    let bottom;
    let start;
    let end;
    let height_map;
    let average_height;
    let elements = node.children;
    let { top_buffer, bottom_buffer, item_height, items } = options;
    function refresh(options) {
        return __awaiter(this, void 0, void 0, function* () {
            top_buffer = options.top_buffer;
            bottom_buffer = options.bottom_buffer;
            item_height = options.item_height;
            items = options.items;
            const { scrollTop, offsetHeight } = node;
            yield tick(); // wait until the DOM is up to date
            let content_height = top - scrollTop - bottom_buffer;
            // vertical
            let y = start;
            while (content_height < offsetHeight) {
                let row = elements[y - start];
                if (!row) {
                    end = y + 1;
                    yield tick(); // render the newly visible row
                    row = elements[y - start];
                }
                const row_height = (height_map[y] =
                    item_height || elements[y - start].offsetHeight);
                content_height += row_height;
                y += 1;
            }
            end = y;
            let remaining = items.length - end;
            average_height = (top + content_height) / end;
            bottom = remaining * average_height;
            height_map.length = items.length;
        });
    }
    function compute() {
        const { scrollTop, offsetHeight } = node;
        if (!scrollTop || !elements)
            return;
        // vertical scrolling
        for (let v = 0; v < elements.length; v += 1) {
            height_map[start + v] = item_height || elements[start + v].offsetHeight;
        }
        let r = 0;
        let y = 0;
        while (true) {
            const row_height = height_map[r] || average_height;
            if (y + row_height > scrollTop - top_buffer) {
                start = r;
                top = y;
                break;
            }
            y += row_height;
            r += 1;
        }
        while (true) {
            y += height_map[r] || average_height;
            r += 1;
            if (y > scrollTop + offsetHeight + bottom_buffer)
                break;
        }
        end = r;
        const remaining = end > items.length
            ? (offsetHeight + bottom_buffer) / 24
            : items.length - end;
        average_height = y / end;
        // while (r < data.length) height_map[r++] = average_height;
        bottom = remaining * average_height;
    }
    node.addEventListener("scroll", compute);
    return {
        update(options) {
            refresh(options);
        },
        destroy() {
            node.removeEventListener("scroll", compute);
        },
    };
}
//# sourceMappingURL=index.js.map