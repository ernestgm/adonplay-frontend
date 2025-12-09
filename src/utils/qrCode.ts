export default function handleDownloadQr()  {
    const canvas = document.getElementById("qrcode-canvas") as HTMLCanvasElement;
    if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode.png`;
        a.click();
    }
};