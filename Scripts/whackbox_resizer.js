var H_WHACKBOX_INFO =
{
    defaultWidth: 960,
    defaultHeight: 640,
    minScale: 0.1,
    maxScale: 1,
    aspect: 960 / 640
};

var V_WHACKBOX_INFO =
{
    defaultWidth: 640,
    defaultHeight: 960,
    minScale: 0.1,
    maxScale: 1,
    aspect:  640 / 960
};

var WHACKBOX_RELATIVE_MARGIN =
{
    t: 0.1,
    l: 0.1,
    r: 0.1,
    b: 0.1,
};

var WHACKBOX_CENTRE_UV =
{
    x: 0.5,
    y: 0.5,
};


var whackboxBound = document.getElementById("whackbox-bound");
var whackbox = document.getElementById("whackbox");

var whackbox_h_layout = document.getElementById("whackbox-h-layout");
var whackbox_v_layout = document.getElementById("whackbox-v-layout");


var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function updateSize()
{
    var window_w, window_h;
    if (isMobile)
    {
        window_w = window.innerWidth;
        window_h = window.innerHeight;
    }
    else
    {
        window_w = window.innerWidth;
        window_h = window.innerHeight;
    }

    // Calculate the preferred margin for the bound of the whackbox.
    var margin_l = window_w * WHACKBOX_RELATIVE_MARGIN.l;
    var margin_r = window_w * WHACKBOX_RELATIVE_MARGIN.r;
    var margin_t = window_h * WHACKBOX_RELATIVE_MARGIN.t;
    var margin_b = window_h * WHACKBOX_RELATIVE_MARGIN.b;

    var available_w = window_w - margin_l - margin_r;
    var available_h = window_h - margin_t - margin_b;
    var available_aspect = available_w / available_h;

    var scale, w, h;
    if (available_aspect >= 1)
    {
        // If we set the width of the whackbox to the width of the available space,
        // the height of the whackbox would exceed that of the space.
        // Thus, the scale should be calculated based on the height of the available space.
        if (available_aspect > H_WHACKBOX_INFO.aspect)
        {
            scale = clamp(
                available_h / H_WHACKBOX_INFO.defaultHeight,
                H_WHACKBOX_INFO.minScale,
                H_WHACKBOX_INFO.maxScale
            );
        }
        else
        {
            scale = clamp(
                available_w / H_WHACKBOX_INFO.defaultWidth,
                H_WHACKBOX_INFO.minScale,
                H_WHACKBOX_INFO.maxScale
            );
        }
        // Scale the bounds of the whackbox appropriately.
        // The scale property should be avoided as other non-child elements will not react to those changes.
        w = Math.round(H_WHACKBOX_INFO.defaultWidth * scale);
        h = Math.round(H_WHACKBOX_INFO.defaultHeight * scale);

        // Set the base width and height of the actual whackbox,
        // then scale it relative to its top-left corner to fill up the entire whackbox bound.
        whackbox.style.width = H_WHACKBOX_INFO.defaultWidth + "px";
        whackbox.style.height = H_WHACKBOX_INFO.defaultHeight + "px";
        whackbox.style.transformOrigin = "0% 0%";
        whackbox.style.scale = scale;

        whackbox_h_layout.hidden = false;
        whackbox_v_layout.hidden = true;
    }
    else
    {
        // If we set the height of the whackbox to the height of the available space,
        // the width of the whackbox would exceed that of the space.
        // Thus, the scale should be calculated based on the width of the available space.
        if (available_aspect < V_WHACKBOX_INFO.aspect)
        {
            scale = clamp(
                available_w / V_WHACKBOX_INFO.defaultWidth,
                V_WHACKBOX_INFO.minScale,
                V_WHACKBOX_INFO.maxScale
            );
        }
        else
        {
            scale = clamp(
                available_h / V_WHACKBOX_INFO.defaultHeight,
                V_WHACKBOX_INFO.minScale,
                V_WHACKBOX_INFO.maxScale
            );
        }
        // Scale the bounds of the whackbox appropriately.
        // The scale property should be avoided as other non-child elements will not react to those changes.
        w = Math.round(V_WHACKBOX_INFO.defaultWidth * scale);
        h = Math.round(V_WHACKBOX_INFO.defaultHeight * scale);

        // Set the base width and height of the actual whackbox,
        // then scale it relative to its top-left corner to fill up the entire whackbox bound.
        whackbox.style.width = V_WHACKBOX_INFO.defaultWidth + "px";
        whackbox.style.height = V_WHACKBOX_INFO.defaultHeight + "px";
        whackbox.style.transformOrigin = "0% 0%";
        whackbox.style.scale = scale;

        whackbox_h_layout.hidden = true;
        whackbox_v_layout.hidden = false;
    }
    whackboxBound.style.width = w + "px";
    whackboxBound.style.height = h + "px";

    // Calculate the additional margin by distributing the remaining space based on a factor.
    var extra_margin_l = Math.round((available_w - w) * WHACKBOX_CENTRE_UV.x);
    var extra_margin_r = available_w - w - extra_margin_l;
    var extra_margin_t = Math.round((available_h - h) * WHACKBOX_CENTRE_UV.y);
    var extra_margin_b = available_h - h - extra_margin_t;

    // Set the margin of the whackbox to orient it on the page.
    whackboxBound.style.marginLeft = (margin_l + extra_margin_l) + "px";
    whackboxBound.style.marginRight = (margin_r + extra_margin_r) + "px";
    whackboxBound.style.marginTop = (margin_t + extra_margin_t) + "px";
    whackboxBound.style.marginBottom = (margin_b + extra_margin_b) + "px";
}

onresize = updateSize;