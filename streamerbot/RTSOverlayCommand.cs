using System;

public class CPHInline
{
    private const string EventName = "RTS - Overlay - Extension Command";

    public bool Execute()
    {
        if (!CPH.TryGetArg("rtsOverlayExtension", out string extension) ||
            string.IsNullOrWhiteSpace(extension))
            return false;

        if (!CPH.TryGetArg("rtsOverlayCommand", out string command) ||
            string.IsNullOrWhiteSpace(command))
            return false;

        CPH.SetArgument("rtsOverlayExtension", extension);
        CPH.SetArgument("rtsOverlayCommand", command);

        if (CPH.TryGetArg("rtsOverlayData", out string data))
            CPH.SetArgument("rtsOverlayData", data);

        CPH.TriggerEvent(EventName, true);
        return true;
    }
}
