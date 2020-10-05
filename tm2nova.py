#!/usr/bin/env python


import argparse
import os
import plistlib
import sys
import warnings
import xml.etree.ElementTree as et
import xml.sax.saxutils as su

# http://effbot.org/zone/element-lib.htm#prettyprint
def indent(elem, level=0):
    i = "\n" + level*"  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for elem in elem:
            indent(elem, level+1)
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i
    return elem


def captures_to_scope(captures, tag):
    for (group, obj) in sorted(captures.items()):
        name = obj.pop("name")
        if obj.keys() != []:
            keys = ",".join(obj.keys())
            raise Exception("Unknown capture keys: {}".format(keys))
        capture = et.SubElement(tag, "capture", number=group, name=name)


def include_to_scope(pattern, tag):
    kwargs = {
            "syntax": "self",
            "collection": pattern["include"].lstrip("#")
        }
    include = et.SubElement(tag, "include", **kwargs)


def match_to_scope(pattern, tag):
    if "name" not in pattern:
        warnings.warn("Pattern has no name! {}".format(pattern))
    name = pattern.pop("name", "")
    match = pattern.pop("match")
    captures = pattern.pop("captures", {})
    if pattern.keys() != []:
        keys = ",".join(pattern.keys())
        raise Exception("Unknown match keys: {}".format(keys))

    scope = et.SubElement(tag, "scope", name=name)
    expression = et.SubElement(scope, "expression")
    expression.text = su.escape(match)
    captures_to_scope(captures, scope)


def begin_end_to_scope(pattern, tag):
    if "name" not in pattern:
        warnings.warn("Pattern has no name! {}".format(pattern))
    name = pattern.pop("name", "")
    begin = pattern.pop("begin")
    beginCaptures = pattern.pop("beginCaptures", {})
    end = pattern.pop("end")
    endCaptures = pattern.pop("endCaptures", {})
    subpatterns = pattern.pop("patterns", [])
    if pattern.keys() != []:
        keys = ",".join(pattern.keys())
        raise Exception("Unknown pattern keys: {}".format(keys))

    scope = et.SubElement(tag, "scope", name=name)
    starts_with = et.SubElement(scope, "starts-with")
    expression = et.SubElement(starts_with, "expression")
    expression.text = su.escape(begin)
    captures_to_scope(beginCaptures, starts_with)

    ends_with = et.SubElement(scope, "ends-with")
    expression = et.SubElement(ends_with, "expression")
    expression.text = su.escape(end)
    captures_to_scope(endCaptures, ends_with)

    if not subpatterns:
        return

    subscopes = et.SubElement(scope, "subscopes")
    for pattern in subpatterns:
        pattern_to_scope(pattern, subscopes)


def pattern_to_scope(pattern, tag):
    if "include" in pattern:
        include_to_scope(pattern, tag)
    elif "match" in pattern:
        match_to_scope(pattern, tag)
    elif "begin" in pattern and "end" in pattern:
        begin_end_to_scope(pattern, tag)
    else:
        keys = ",".join(pattern.keys())
        raise Exception("Unknown pattern with keys: {}".format(keys))


def build_syntax(data, tgt):
    # import json
    # print json.dumps(data, indent=4, sort_keys=True)

    syntax = et.Element("syntax", name=data["name"].lower())

    # Build the meta tag
    meta = et.SubElement(syntax, "meta")
    name = et.SubElement(meta, "name")
    name.text = data["name"]
    meta_type = et.SubElement(meta, "type")
    meta_type.text = "script"
    file_ext = et.SubElement(meta, "preferred-file-extension")
    file_ext.text = data["fileTypes"][0]

    # Build file extension detector
    detectors = et.SubElement(syntax, "detectors")
    extension = et.SubElement(detectors, "extension", priority="1.0")
    extension.text = ",".join(data["fileTypes"])

    # Scopes from Patterns
    scopes = et.SubElement(syntax, "scopes")
    for pattern in data["patterns"]:
        pattern_to_scope(pattern, scopes)

    # Collections from repository
    collections = et.SubElement(syntax, "collections")
    for (name, item) in data.get("repository", {}).items():
        collection = et.SubElement(collections, "collection", name=name)
        if item.keys() == ["patterns"]:
            for pattern in item["patterns"]:
                pattern_to_scope(pattern, collection)
        else:
            pattern_to_scope(item, collection)

    indent(syntax)
    et.ElementTree(syntax).write(tgt, encoding="UTF-8")
    tgt.write("\n")


def parse_args():
    descr = "Transate TextMate Syntax plists to Nova XML Format"
    p = argparse.ArgumentParser(description=descr)
    p.add_argument(
            'src',
            metavar='SOURCE',
            type=str,
            help='Source plist file to translate'
        )
    p.add_argument(
            '--tgt',
            metavar='TARGET',
            type=str,
            default='-',
            help='Target to write output'
    )
    return p.parse_args()


def main():
    args = parse_args()
    if args.src == '-':
        src = sys.stdin
    else:
        if not os.path.exists(args.src):
            print "File not found: {}".format(args.src)
        src = open(args.src)
    if args.tgt == '-':
        tgt = sys.stdout
    else:
        tgt = open(args.tgt, "w+")
    try:
        data = plistlib.readPlist(src)
    except:
        print "Unable to read plist from '{}'".format(args.src)
        raise
    syntaxes = build_syntax(data, tgt)


if __name__ == "__main__":
    main()
