using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Backend.Hubs
{
    public class TaskHub : Hub
    {
        // Frontend isko call kar ke sabko live update bhej sakta hai
        public async Task NotifyStatusUpdate(string taskId, string newStatus)
        {
            await Clients.All.SendAsync("ReceiveStatusUpdate", taskId, newStatus);
        }
    }
}