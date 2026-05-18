using System.Fabric;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.UserStatelessService;

internal static class Program
{
    private static void Main()
    {
        ServiceRuntime.RegisterServiceAsync(
                "UserStatelessServiceType",
                context => new UserStatelessService(context))
            .GetAwaiter()
            .GetResult();

        Thread.Sleep(Timeout.Infinite);
    }
}
