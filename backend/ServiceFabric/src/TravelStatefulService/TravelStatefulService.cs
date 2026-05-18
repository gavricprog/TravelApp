using System.Fabric;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelApp.ServiceFabric.TravelStatefulService;

internal sealed class TravelStatefulService : StatefulService
{
    public TravelStatefulService(StatefulServiceContext context)
        : base(context)
    {
    }

    protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
    {
        return Array.Empty<ServiceReplicaListener>();
    }

    protected override async Task RunAsync(CancellationToken cancellationToken)
    {
        var metadata = await StateManager.GetOrAddAsync<IReliableDictionary<string, string>>("travel-service-metadata");

        using var tx = StateManager.CreateTransaction();
        await metadata.AddOrUpdateAsync(
            tx,
            "service-boundary",
            "TravelModule",
            (_, _) => "TravelModule");
        await tx.CommitAsync();
    }
}
