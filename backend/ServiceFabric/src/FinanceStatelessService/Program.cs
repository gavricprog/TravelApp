using System.Fabric;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.FinanceStatelessService;

internal static class Program
{
    private static void Main()
    {
        ServiceRuntime.RegisterServiceAsync(
                "FinanceStatelessServiceType",
                context => new FinanceStatelessService(context))
            .GetAwaiter()
            .GetResult();

        Thread.Sleep(Timeout.Infinite);
    }
}
