function clamp(value, min, max)
{
    if (value < min)
    {
        value = min;
    }
    if (value > max)
    {
        value = max;
    }
    return value;
}

function randomItemFromArray(arr)
{
    return arr[Math.floor(Math.random() * arr.length)]
}

var processNodeDeletionQueue = [];
var timeScalePerFrameProcess = 1.0;
var MIN_PER_FRAME_DELAY = 67;


class ProcessTreeNode
{
    constructor(parent = null, children = [])
    {
        this.parent = null;
        this.children = [];
        this.isQueuedForDeletion = false;

        if (parent != null)
        {
            parent.addChild(this);
        }

        for (var child of children) // "for x of xs" to iterate over objects instead of addresses 
        {
            this.addChild(child);
        }
    }

    getChildIndex(child)
    {
        return this.children.indexOf(child);
    }

    removeChildByIndex(childIndex, deleteChild = true)
    {
        if (childIndex >= 0 && childIndex < this.children.length)
        {
            if (deleteChild)
            {
                var removedChild = this.children[childIndex];
                this.children.splice(childIndex, 1);
                removedChild.queue_delete();
            }
            else
            {
                this.children.splice(childIndex, 1);
            }
        }
        else
        {
            console.warn(this + " has no children of index " + childIndex + " to remove.");
        }
    }

    removeChild(child, deleteChild = true)
    {
        var childIndex = this.getChildIndex(child);
        if (childIndex >= 0)
        {
            this.removeChildByIndex(childIndex, deleteChild);
        }
        else
        {
            console.warn(child + " is not a child node of " + this + " and cannot be removed from the array of children.");
        }
    }

    clearChildren(deleteChildren = true)
    {
        if (deleteChildren)
        {
            // Use a copy of the array of children instead of the actual array in case some children automatically remove themselves.
            var currentChildren = this.children.slice();

            for (var i = 0; i < currentChildren.length; ++i)
            {
                currentChildren[i].queue_delete();
            }
        }
        this.children = [];
    }

    addChild(child)
    {
        if (child.parent == null)
        {
            this.children.push(child);
            child.parent = this;
        }
        else
        {
            console.warn(child + " aready has a parent and cannot be added as a child node.");
        }
    }

    moveChild(child, toIndex)
    {
        var childIndex = this.getChildIndex(child);
        if (childIndex >= 0)
        {
            this.children.splice(childIndex, 1);
            this.children.splice(clamp(toIndex, 0, this.children.length), 0, child);
        }
        else
        {
            console.warn(child + " is not a child of " + this + " and cannot be moved within the array of children.");
        }
    }


    tick(delta)
    {
        // Use a copy of the array of children instead of the actual array in case some children automatically remove themselves.
        var currentChildren = this.children.slice();

        for (var i = 0; i < currentChildren.length; ++i)
        {
            currentChildren[i].tick(delta);
        }
    }

    queue_delete()
    {
        this.isQueuedForDeletion = true;
        processNodeDeletionQueue.push(this);
        // Use a copy of the array of children instead of the actual array in case some children automatically remove themselves.
        var currentChildren = this.children.slice();

        for (var i = 0; i < currentChildren.length; ++i)
        {
            currentChildren[i].queue_delete();
        }
    }
}


var processTreeRoot = new ProcessTreeNode();

var perFrameProcess = null;
var perFrameProcessLastFrameTime = 0.0;


function tickPerFrameProcess()
{
    var perFrameProcessCurrentFrameTime = Date.now();
    var delta;

    if (perFrameProcessLastFrameTime < perFrameProcessCurrentFrameTime)
    {
        // Get elapsed time in milliseconds, then convert it to seconds.
        delta = (perFrameProcessCurrentFrameTime - perFrameProcessLastFrameTime) * 0.001;
    }
    else
    {
        delta = 0.0;
    }
    perFrameProcessLastFrameTime = perFrameProcessCurrentFrameTime;

    // Update the process tree.
    processTreeRoot.tick(delta);

    // Clean up deleted nodes.
    for (var deletedNode of processNodeDeletionQueue) // "for x of xs" to iterate over objects instead of addresses 
    {
        var deletedNodeParent = deletedNode.parent;
        if (deletedNodeParent != null && !deletedNodeParent.isQueuedForDeletion)
        {
            deletedNodeParent.removeChild(deletedNode, false);
        }
        deletedNode.clearChildren(false);
    }
    processNodeDeletionQueue = [];
}

function startPerFrameProcessLoop()
{
    if (perFrameProcess == null)
    {
        perFrameProcess = setInterval(tickPerFrameProcess, MIN_PER_FRAME_DELAY);
        perFrameProcessLastFrameTime = Date.now();
    }
}

function stopPerFrameProcessLoop()
{
    if (perFrameProcess != null)
    {
        clearInterval(perFrameProcess);
        perFrameProcess = null;
    }
}


function getTimeScalePerFrameProcess()
{
    return timeScalePerFrameProcess;
}

function setTimeScalePerFrameProcess(value)
{
    timeScalePerFrameProcess = value;
}