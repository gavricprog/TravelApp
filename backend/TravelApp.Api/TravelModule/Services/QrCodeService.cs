using QRCoder;

namespace TravelApp.Api.TravelModule.Services;

public class QrCodeService : IQrCodeService
{
    public string GeneratePngDataUrl(string content)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        var pngQrCode = new PngByteQRCode(qrData);
        var pngBytes = pngQrCode.GetGraphic(12);
        return $"data:image/png;base64,{Convert.ToBase64String(pngBytes)}";
    }
}
