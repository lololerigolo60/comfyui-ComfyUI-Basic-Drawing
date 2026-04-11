import { app } from "/scripts/app.js";

app.registerExtension({
    name: "DrawingBoard.Extension",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "BasicDrawingBoard") {
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                const dataWidget = this.widgets.find(w => w.name === "image_data");
                const widthWidget = this.widgets.find(w => w.name === "width");
                const heightWidget = this.widgets.find(w => w.name === "height");
                if (dataWidget) dataWidget.type = "hidden";

                const div = document.createElement("div");
                div.style.backgroundColor = "#1a1a1a";
                div.style.padding = "10px";
                div.style.borderRadius = "4px";
                
                div.innerHTML = `
                    <div style="margin-bottom:10px; display:flex; gap:5px; align-items:center; justify-content:center; flex-wrap:wrap;">
                        <input type="color" id="colorPicker" value="#ffffff" style="border:none; width:25px; height:25px; cursor:pointer;">
                        <input type="range" id="brushSize" min="1" max="100" value="10" style="width:60px;">
                        <button id="brushBtn" title="Pinceau">🖌️</button>
                        <button id="fillBtn" title="Pot de peinture">🫗</button>
                        <button id="eraserBtn" title="Gomme">🧽</button>
                        <button id="syncBtn" style="background:#444; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">🔄 Sync</button>
                        <button id="autoMaskBtn" style="background:#2a5a8a; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">🤖 Auto</button>
                        <button id="clearBtn">🗑️</button>
                    </div>
                    <div style="position:relative; background:#000; border:2px solid #333; line-height:0;">
                        <canvas id="bgCanvas" style="position:absolute; top:0; left:0; width:100%; height:auto; z-index:1;"></canvas>
                        <canvas id="mainCanvas" style="position:relative; cursor:crosshair; width:100%; height:auto; z-index:2; background:transparent;"></canvas>
                    </div>
                `;

                const canvas = div.querySelector("#mainCanvas");
                const bgCanvas = div.querySelector("#bgCanvas");
                const ctx = canvas.getContext("2d");
                const bgCtx = bgCanvas.getContext("2d");
                
                this.lastBgFile = null;
                this.lastAutoMask = null;
                let currentMode = "brush";

                const updateValue = () => { dataWidget.value = canvas.toDataURL("image/png"); };

                const resizeCanvas = () => {
                    const w = widthWidget.value || 512;
                    const h = heightWidget.value || 512;
                    [canvas, bgCanvas].forEach(c => {
                        const temp = document.createElement('canvas');
                        temp.width = c.width; temp.height = c.height;
                        temp.getContext('2d').drawImage(c, 0, 0);
                        c.width = w; c.height = h;
                        c.getContext('2d').drawImage(temp, 0, 0, w, h);
                    });
                };

                widthWidget.callback = resizeCanvas;
                heightWidget.callback = resizeCanvas;

                // --- UTILITAIRES COULEURS ---
                const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:255, g:255, b:255};
                };

                // --- POT DE PEINTURE (FLOOD FILL) ---
                const floodFill = (startX, startY, fillColor) => {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const width = imageData.width;
                    const height = imageData.height;
                    const fillRGB = hexToRgb(fillColor);
                    
                    const targetI = (startY * width + startX) * 4;
                    const targetColor = [imageData.data[targetI], imageData.data[targetI+1], imageData.data[targetI+2], imageData.data[targetI+3]];

                    if (Math.abs(targetColor[0]-fillRGB.r)<5 && Math.abs(targetColor[1]-fillRGB.g)<5 && Math.abs(targetColor[2]-fillRGB.b)<5 && targetColor[3] === 255) return;

                    const stack = [[startX, startY]];
                    while (stack.length > 0) {
                        const [x, y] = stack.pop();
                        let i = (y * width + x) * 4;
                        if (x < 0 || x >= width || y < 0 || y >= height) continue;
                        if (Math.abs(imageData.data[i]-targetColor[0])<5 && Math.abs(imageData.data[i+1]-targetColor[1])<5 && Math.abs(imageData.data[i+2]-targetColor[2])<5 && Math.abs(imageData.data[i+3]-targetColor[3])<5) {
                            imageData.data[i] = fillRGB.r; imageData.data[i+1] = fillRGB.g; imageData.data[i+2] = fillRGB.b; imageData.data[i+3] = 255;
                            stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    updateValue();
                };

                // --- GESTION ÉVÉNEMENTS ---
                let drawing = false;
                canvas.onmousedown = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
                    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
                    if (currentMode === "fill") { floodFill(x, y, div.querySelector("#colorPicker").value); } 
                    else { drawing = true; ctx.beginPath(); }
                };

                window.addEventListener("mouseup", () => { if(drawing) { drawing = false; updateValue(); } });
                
                canvas.onmousemove = (e) => {
                    if (!drawing || currentMode === "fill") return;
                    const rect = canvas.getBoundingClientRect();
                    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                    ctx.lineWidth = div.querySelector("#brushSize").value;
                    ctx.lineCap = "round";
                    ctx.globalCompositeOperation = (currentMode === "eraser") ? "destination-out" : "source-over";
                    if (currentMode !== "eraser") ctx.strokeStyle = div.querySelector("#colorPicker").value;
                    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
                };

                // --- BOUTONS ---
                div.querySelector("#brushBtn").onclick = () => currentMode = "brush";
                div.querySelector("#eraserBtn").onclick = () => currentMode = "eraser";
                div.querySelector("#fillBtn").onclick = () => currentMode = "fill";
                div.querySelector("#clearBtn").onclick = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); updateValue(); };
                
                div.querySelector("#syncBtn").onclick = () => {
                    if (!this.lastBgFile) return;
                    const img = new Image();
                    img.onload = () => { bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height); };
                    img.src = `/view?filename=${encodeURIComponent(this.lastBgFile)}&type=temp&t=${Date.now()}`;
                };

                div.querySelector("#autoMaskBtn").onclick = () => {
                    if (!this.lastAutoMask) return;
                    const img = new Image();
                    img.onload = () => {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const maskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
                        const pixels = maskData.data;
                        const fillColor = hexToRgb(div.querySelector("#colorPicker").value);
                        for (let i = 0; i < pixels.length; i += 4) {
                            const b = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
                            if (b > 10) { pixels[i]=fillColor.r; pixels[i+1]=fillColor.g; pixels[i+2]=fillColor.b; pixels[i+3]=b; } 
                            else { pixels[i+3] = 0; }
                        }
                        tempCtx.putImageData(maskData, 0, 0);
                        ctx.drawImage(tempCanvas, 0, 0);
                        updateValue();
                    };
                    img.src = `/view?filename=${encodeURIComponent(this.lastAutoMask)}&type=temp&t=${Date.now()}`;
                };

                this.onExecuted = (output) => {
                    if (output?.bg_file) this.lastBgFile = output.bg_file[0];
                    if (output?.auto_mask) this.lastAutoMask = output.auto_mask[0];
                };

                setTimeout(resizeCanvas, 100);
                this.addDOMWidget("drawing_ui", "canvas", div);
                this.size = [550, 720];
                return r;
            };
        }
    }
});
