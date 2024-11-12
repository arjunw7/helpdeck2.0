import { Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const ResizableImage = Image.extend({
  name: "resizableImage",
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 'auto',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement('div');
      container.classList.add('image-resizer');

      const img = document.createElement('img');
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        img.setAttribute(key, value as string);
      });

      const updateSize = (width: number, height: number) => {
        if (typeof getPos === 'function') {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(getPos(), undefined, {
              ...node.attrs,
              width: `${width}px`,
              height: `${height}px`,
            });
            return true;
          });
        }
      };

      // Create resize handles for all corners
      const handles = {
        nw: document.createElement('div'),
        ne: document.createElement('div'),
        sw: document.createElement('div'),
        se: document.createElement('div'),
      };

      Object.entries(handles).forEach(([position, handle]) => {
        handle.classList.add('resize-handle', `resize-handle-${position}`);
        container.appendChild(handle);
      });

      // Handle image selection
      const updateSelection = () => {
        const selected = editor.view.state.selection.from === getPos();
        container.classList.toggle('selected', selected);
      };

      editor.on('selectionUpdate', updateSelection);

      // Handle resize functionality
      Object.entries(handles).forEach(([position, handle]) => {
        handle.addEventListener('mousedown', (startEvent) => {
          startEvent.preventDefault();

          const startX = startEvent.clientX;
          const startY = startEvent.clientY;
          const startWidth = img.clientWidth;
          const startHeight = img.clientHeight;
          const aspectRatio = startWidth / startHeight;

          const onMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();

            let dx = moveEvent.clientX - startX;
            let dy = moveEvent.clientY - startY;

            // Adjust dx and dy based on the handle position
            if (position.includes('w')) dx *= -1;
            if (position.includes('n')) dy *= -1;

            // Calculate new dimensions maintaining aspect ratio
            let newWidth = startWidth + dx;
            let newHeight = newWidth / aspectRatio;

            // Ensure minimum dimensions
            if (newWidth < 60 || newHeight < 60) return;

            updateSize(newWidth, newHeight);
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });

      // Handle image click for selection
      img.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          editor.commands.setNodeSelection(getPos());
        }
      });

      container.appendChild(img);
      
      return {
        dom: container,
        update: (updatedNode) => {
          Object.entries(updatedNode.attrs).forEach(([key, value]) => {
            img.setAttribute(key, value as string);
          });
          updateSelection();
          return true;
        },
        destroy: () => {
          editor.off('selectionUpdate', updateSelection);
        },
      };
    };
  },
});