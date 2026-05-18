using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.UserStatelessService;

internal sealed class UserStatelessService : StatelessService
{
    public UserStatelessService(StatelessServiceContext context)
        : base(context)
    {
    }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        return Array.Empty<ServiceInstanceListener>();
    }
}
