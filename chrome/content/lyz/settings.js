function onLoad() {
    document.getElementById("lyxserver").value = window.arguments[0].inn.lyxserver;
    document.getElementById("citekey").value = window.arguments[0].inn.citekey;
}

function onOK() {
    window.arguments[0].out = {lyxserver:document.getElementById("lyxserver").value,
			       citekey:document.getElementById("citekey").value};
    return true;
}
