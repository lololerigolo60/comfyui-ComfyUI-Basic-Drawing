🎨 Complete User Manual: Basic Drawing Board

The Basic Drawing Board is a hybrid creative tool designed for ComfyUI. It allows you to transform manual sketches or color modifications into photorealistic images using "Edit" diffusion models.
🚀 Two Main Creative Modes
1. Pure Creation (Concept-to-Photo)

You don't need a source image. Start from a blank page to bring an idea to life.

    The Principle: Draw simple shapes and color masses (e.g., a red circle and a green rectangle).

    The Action: Your drawing acts as a structural and chromatic guide. Paired with a prompt like "a red apple on a table", the model will transform your brushstrokes into real objects.

    Utility: Precisely control the composition and colors of a generated image.

2. Tracing & Transformation (The "Decal" Method)

Use an existing image for modification or inspiration.

    The Principle: Load a reference image in the background to draw over it with precision.

    The Action: Once your trace is finished, you can delete the background image to keep only your "traced" drawing.

    Utility: Add accessories (glasses, hat), change clothes, or modify a character's pose.

🛠️ Toolbar Guide
Icon	Tool	Function
<input type="color" disabled>	Color Picker	Crucial: The chosen color defines the final color of the AI-generated object.
<input type="range" disabled>	Brush Size	Adjust stroke thickness for precision or large fills.
🖌️	Brush	Standard free-hand drawing tool.
🫗	Paint Bucket	Instantly fills a closed area with the selected color.
🧽	Eraser	Erases the drawing (creates transparency in the mask).
🧪	Eyedropper	Samples color from your drawing 🎨 or the background image 🖼️.
↩️ / ↪️	Undo / Redo	Undo or redo an action (Shortcuts: Ctrl+Z / Ctrl+Y).
🔄 Sync	Synchronization	Imports the image connected to the image input onto the background layer.
🤖 Auto	Auto-Mask	Automatically fills the area detected by an external node (like SAM) with your color.
🎨🗑️	Clear Drawing	Deletes all your manual sketches (the background remains intact).
🖼️🗑️	Clear Background	Deletes only the reference image (your sketch remains intact for tracing).
⚙️ Advanced Features: Sync & Auto
🔄 Using the SYNC Button

This is the bridge between your ComfyUI workflow and the canvas.

    How to: Connect any image node to the image input. Click Sync to display it behind the Drawing Board.

    Note: This does not replace your current drawing; it only changes what is "behind" it.

🤖 Using the AUTO Button

Ideal for modifying specific objects without overstepping boundaries.

    How to: Connect a MASK output (from a detection node like Segment Anything / SAM) to the auto_mask input. Pick a color, then click Auto.

    Result: The detected area is instantly painted. You can then use the eraser or brush to refine the mask manually.

💡 Connecting to "Edit" Models (Flux / Klein)

To make the magic happen, the node sends two essential pieces of information to the model:

    IMAGE (Output): The blend of your drawing and the background. This is the visual guide.

    MASK (Output): The exact area where you drew. This defines the AI's workspace.

Final Tip: For optimal results, try to use colors close to what you want to achieve (e.g., a dark blue for a night sky). The closer your drawing is to your intention in terms of shape and color, the more faithful the "Edit" model will be to your idea!
