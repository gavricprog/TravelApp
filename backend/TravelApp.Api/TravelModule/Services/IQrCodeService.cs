namespace TravelApp.Api.TravelModule.Services;

public interface IQrCodeService
{
    string GeneratePngDataUrl(string content);
}
