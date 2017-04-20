const domIndex = require("virtual-dom/vdom/dom-index"),
    isArray = require("x-is-array"),
    patchOp = require("virtual-dom/vdom/patch-op"),
    document = require("global/document"),
    diff = require("virtual-dom/diff"),
    patch = require("virtual-dom/patch"),
    createElement = require("virtual-dom/create-element"),
    VNode = require("virtual-dom/vnode/vnode"),
    VText = require("virtual-dom/vnode/vtext"),
    VPatch = require("virtual-dom/vnode/vpatch.js"),
    convertHTML = require("html-to-vdom")({
        VNode: VNode,
        VText: VText
    }),
    node = require("./node.js");

let parser1 = new Promise(function(resolve, reject) {
    resolve(
        convertHTML(
            '<h1 class="bd a" style="position:fixed;">aaaopo<span>inset</span>qdasd</h1>'
        )
    );
});
let parser2 = new Promise(function(resolve, reject) {
    resolve(
        convertHTML(
            '<h1 class="bd a" style="position:absolute;">aaaopo<span>inset</span>qdasd</h1>'
        )
    );
});
Promise.all([parser1, parser2]).then(function(result) {
    rootNode = createElement(result[0]);
    patches = diff(result[0], result[1]);
    rootNode = patch(rootNode, patches, {
        patch: function(rootNode, patches, renderOptions) {
            var indices = patchIndices(patches);

            if (indices.length === 0) {
                return rootNode;
            }

            var index = domIndex(rootNode, patches.a, indices);
            var ownerDocument = rootNode.ownerDocument;

            if (!renderOptions.document && ownerDocument !== document) {
                renderOptions.document = ownerDocument;
            }
            for (var i = 0; i < indices.length; i++) {
                var nodeIndex = indices[i];
                rootNode = applyPatch(
                    rootNode,
                    index[nodeIndex],
                    patches[nodeIndex],
                    renderOptions
                );
            }
            return rootNode;
        }
    });
    console.log(new node(rootNode).toString());
});

function addClass(patch, domNode, renderOptions) {
    switch (patch.type) {
        case VPatch.INSERT:
            if (!patch.patch.properties.attributes.class) {
                patch.patch.properties.attributes.class = "addNode";
            } else {
                patch.patch.properties.attributes.class += " addNode";
            }
            break;
        case VPatch.VTEXT:
            if (domNode.parentNode._attributes.null) {
                if (
                    domNode.parentNode._attributes.null.class.value.indexOf(
                        "changeText"
                    ) == -1
                ) {
                    domNode.parentNode._attributes.null.class.value += " changeText";
                }
            } else {
                domNode.parentNode._attributes = {
                    null: {
                        class: {
                            value: "changeText"
                        }
                    }
                };
            }
            break;
        case VPatch.VNODE:
            if (!patch.patch.properties.attributes.class) {
                patch.patch.properties.attributes.class = "modifyNode";
            } else {
                patch.patch.properties.attributes.class += " modifyNode";
            }
            break;
        case VPatch.ORDER:
            console.log("order");
            break;
        case VPatch.PROPS:
            if (patch.patch.attributes && patch.patch.attributes.class) {
                patch.patch.attributes.class += " changeClass";
            } else {
                if (
                    domNode._attributes.null && domNode._attributes.null.class
                ) {
                    domNode._attributes.null.class.value += " changeProps";
                } else {
                    domNode._attributes.null = {
                        class: {
                            value: "changeProps"
                        }
                    };
                }
            }
            break;
        default:
            console.log(patch.type + "default");
    }
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode;
    }

    var newNode;

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            addClass(patchList[i], domNode, renderOptions);
            newNode = patchOp(patchList[i], domNode, renderOptions);

            if (domNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        addClass(patchList, domNode, renderOptions);
        newNode = patchOp(patchList, domNode, renderOptions);

        if (domNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function patchIndices(patches) {
    var indices = [];

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key));
        }
    }

    return indices;
}
// TODO: 打开指定网页
// TODO: 遍历script脚本，运行，
// TODO: 监听里面抛出事件，保存htmlStr于compare下
// TODO: 路径是script对应路径/脚本名/当前时间戳.text。
// TODO: 替换规则是有一个就直接生成，两个的话保留旧的
// TODO: 两个text读取进行compare,截图时间戳.png。
// TODO: express界面要提供两种图片的对照比较和对应选择哪个是基准的。
const phantom = require('phantom');

(async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    await page.property('viewportSize', {width: 1920, height: 1080});
    const status = await page.open('https://www.baidu.com/');
    console.log(`Page opened with status [${status}].`);

    await page.evaluateJavaScript('function() {  document.body.innerHTML=""; document.body.innerHTML='+convertHTML('<h1>qqq</h1>')+'}')
    await page.render('stackoverflow.png');
    console.log(`File created at [./stackoverflow.pdf]`);

    await instance.exit();
}());
