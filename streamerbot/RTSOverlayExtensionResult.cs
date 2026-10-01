using System;

public class CPHInline
{
    private const string EventName = "RTS - Overlay - Extension Result";

    public bool Execute()
    {
        if (!CPH.TryGetArg("rtsOverlayExtension", out string extension) ||
            string.IsNullOrWhiteSpace(extension))
            return false;

        if (!CPH.TryGetArg("rtsOverlayEvent", out string eventName) ||
            string.IsNullOrWhiteSpace(eventName))
            return false;

        CPH.SetArgument("rtsOverlayExtension", extension);
        CPH.SetArgument("rtsOverlayEvent", eventName);

        if (CPH.TryGetArg("rtsOverlayData", out string data))
            CPH.SetArgument("rtsOverlayData", data);

        CPH.TriggerEvent(EventName, true);
        return true;
    }
}
