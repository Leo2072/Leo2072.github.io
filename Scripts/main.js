// Example Code.
var frameCount = 0;

class Test extends ProcessTreeNode
{
    tick(delta)
    {
        // Create a paragraph node (<p>) to contain the frame info.
        var frameInfo = document.createElement("p");
        frameInfo.innerText = "Time since last frame = " + Math.round(delta * 100) * 0.01 + "\tseconds\t\t-Frame: " + frameCount;

        // Create a line break node (<br>) and add it to the end of the text.
        frameInfo.appendChild(document.createElement("br"));

        // Add the frame info to the end of the body.
        document.body.appendChild(frameInfo);
        frameCount += 1;
    }
}

var test = new Test();
processTreeRoot.addChild(test);


// Set up the toggle-run-button.
var toggleRunButton = document.getElementById("toggle-run-button");

function toggleRun()
{
    startPerFrameProcessLoop();
    toggleRunButton.innerText = "Pause Per-Frame Process";
    toggleRunButton.onclick = togglePause;
}

function togglePause()
{
    stopPerFrameProcessLoop();
    toggleRunButton.innerText = "Run Per-Frame Process";
    toggleRunButton.onclick = toggleRun;
}

toggleRunButton.innerText = "Run Per-Frame Process";
toggleRunButton.onclick = toggleRun;