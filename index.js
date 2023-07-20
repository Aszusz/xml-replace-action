import { getInput, setFailed } from '@actions/core';
import { select } from 'xpath';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFileSync, writeFileSync } from 'fs';

try {
    let filePath = getInput('filepath', {required: true});
    let xpathString = getInput('xpath', {required: true});
    let replaceString = getInput('replace');

    writeFile(filePath, xpathString, replaceString);
} catch (error) {
    console.log(error)
    setFailed(error.message);
}

function writeFile(filePath, xpathString, replaceString) {
    const content = readFileSync(filePath, 'utf8');
    const document = new DOMParser().parseFromString(content);

    const nodes = select(xpathString, document);
    if (nodes.length === 0) {
        setFailed("No matching xml nodes found");
    } else {
        for (const node of nodes) {
            console.log("Setting xml value at " + getNodePath(node));
            if (replaceString === null) {
                node.parentNode.removeChild(node);
            } else {
                node.textContent = replaceString;
            }
        }
        writeFileSync(filePath, new XMLSerializer().serializeToString(document));
    }
}

function getNodePath(node) {
    let parentNode = node.parentNode;
    if (parentNode == null) {
        return node.nodeName;
    }
    return (getNodePath(parentNode)) + "/" + node.nodeName;
}