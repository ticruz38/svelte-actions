import { tick } from "svelte";

export type Options = {
  top_buffer: number;
  bottom_buffer: number;
  item_height: number;
  items: any[];
};

function virtualscroll(node, options) {
  let top;
  let bottom;
  let start;
  let end;
  let height_map;
  let average_height;
  let elements = node.children;
  let { top_buffer, bottom_buffer, item_height, items } = options;

  async function refresh(options) {
    top_buffer = options.top_buffer;
    bottom_buffer = options.bottom_buffer;
    item_height = options.item_height;
    items = options.items;
    const { scrollTop, offsetHeight } = node;
    await tick(); // wait until the DOM is up to date
    let content_height = top - scrollTop - bottom_buffer;
    // vertical
    let y = start;
    while (content_height < offsetHeight) {
      let row = elements[y - start];
      if (!row) {
        end = y + 1;
        await tick(); // render the newly visible row
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
  }

  function compute() {
    const { scrollTop, offsetHeight } = node;
    if (!scrollTop || !elements) return;

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
      if (y > scrollTop + offsetHeight + bottom_buffer) break;
    }
    end = r;
    const remaining =
      end > items.length
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

export default virtualscroll;
