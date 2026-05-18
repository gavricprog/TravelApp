using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.FinanceStatelessService;

internal sealed class FinanceStatelessService : StatelessService
{
    public FinanceStatelessService(StatelessServiceContext context)
        : base(context)
    {
    }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        return Array.Empty<ServiceInstanceListener>();
    }
}
