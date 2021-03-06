window.BASE_PATH = "/";

//api服务地址
window.API_BASE_PATH = "/";

window.mini_debugger = false;

String.prototype.startWith = function (str) {
    var reg = new RegExp("^" + str);
    return reg.test(this);
}

String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
}

/**
 * 获取cooke
 * @param sName cookie名称
 * @param defaultVal 默认值
 * @returns {*} cookie值
 */
function getCookie(sName, defaultVal) {
    var aCookie = document.cookie.split("; ");
    var lastMatch = null;
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0]) {
            lastMatch = aCrumb;
        }
    }
    if (lastMatch) {
        var v = lastMatch[1];
        if (v === undefined) return v;
        return unescape(v);
    }
    return defaultVal;
}

function importResource(path, callback) {
    if (path.indexOf("http") != 0 || path.indexOf("//") != 0) {
        if (!path.startWith("/"))
            path = window.BASE_PATH + path;
    }
    var head = document.getElementsByTagName('head')[0];
    if (path.endWith("js")) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.timeout = 120000;
        if (typeof callback != "undefined")
            script.async = false;
        script.src = path;

        function onload() {
            if (callback) callback();
        }

        script.onreadystatechange = function () {
            var r = script.readyState;
            if (r === 'loaded' || r === 'complete') {
                script.onreadystatechange = null;
                onload();
            }
        };
        script.onload = onload;
        script.onerror = onload;
        head.appendChild(script);
    } else if (path.endWith("css")) {
        var style = document.createElement('link');
        style.rel = "stylesheet";
        style.href = path;
        style.type = "text/css";
        head.appendChild(style);
        if (callback) callback();
    }
}

function initRequireJs() {
    require.config({
        waitSeconds: 0,
        map: {
            '*': {
                'css': BASE_PATH + "plugins/require-css/0.1.10/css.js",
                'text': BASE_PATH + "plugins/requirejs-text/2.0.15/text.js"
            }
        },
        shim: {
            'jquery': {exports: "$"}
        },
        paths: {
            "jquery": [BASE_PATH + "plugins/jquery/1.10.2/jquery.min"],
            "logger": [BASE_PATH + "admin/logger"],
            "authorize": [BASE_PATH + "admin/commons/authorize"], //权限管理
            "request": [BASE_PATH + "plugins/tools/request"], //ajax请求工具
            "miniui-tools": [BASE_PATH + "plugins/miniui/tools"],
            "message": [BASE_PATH + "plugins/miniui/message"],
            "ace": [BASE_PATH + "plugins/script-editor/ace"],
            "art-template": [BASE_PATH + "plugins/template/art-template"],
            "script-editor": [BASE_PATH + "plugins/script-editor/script-editor"],
            "plugin": [BASE_PATH + "plugins"],
            "pages": [BASE_PATH + "admin"]
        }
    });
}

function importJquery(callback) {
    require(["jquery"], callback);
    // importResource("/plugins/jquery/1.10.2/jquery.min.js", callback);
}

function importMiniui(callback) {
    function doImport() {
        //重复引入
        if (window.mini) {
            callback();
            return;
        }
        var theme = getCookie("theme", window.miniui_theme ? window.miniui_theme : "pure");
        var mode = getCookie("mode", window.outerHeight > 1000 ? "large" : "medium");

        function loadMini() {
            importResource(BASE_PATH + "plugins/miniui/themes/default/miniui.css");
            importResource(BASE_PATH + "plugins/miniui/themes/icons.css");
            importResource(BASE_PATH + 'plugins/miniui/themes/' + theme + '/skin.css');
            importResource(BASE_PATH + "plugins/miniui/themes/default/" + mode + "-mode.css");
            $.ajax({
                url: BASE_PATH + "plugins/miniui/miniui.js",
                async: false,
                cache: true,
                dataType: "script",
                success: callback,
                error: callback
            });
            if ($(window))
                $(window).resize(function () {
                    if (mini)
                        mini.layout();
                });
        }

        if (!window.jQuery && !window.$) {
            importJquery(loadMini);
        } else {
            loadMini();
        }
    }

    doImport();
}

importResource(BASE_PATH + "plugins/requirejs/2.3.3/require.min.js", initRequireJs);
