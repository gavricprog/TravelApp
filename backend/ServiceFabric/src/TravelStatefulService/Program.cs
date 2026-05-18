using System.Fabric;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.TravelStatefulService;

internal static class Program
{
    private static void Main()
    {
        ServiceRuntime.RegisterServiceAsync(
                "TravelStatefulServiceType",
                context => new TravelStatefulService(context))
            .GetAwaiter()
            .GetResult();

        Thread.Sleep(Timeout.Infinite);
    }
}
