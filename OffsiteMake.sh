#!/bin/bash
#
# Usage:
#
#      OffsiteMake.sh [<path>]
#
# Copy current directory tree to specified path, or the following
# if not specified:
#
#      /tmp/dancebreak_website_<username>
#
# Only "safe" <path>s are permitted, obeying the following:
#
#      1.  Path components may only use characters from the
#          minimally POSIX-portable filename character set:
#               ABCDEFGHIJKLMNOPQRSTUVWXYZ
#               abcdefghijklmnopqrstuvwxyz
#               0123456789._-
#      2.  Path components must begin with an alphanumeric
#          or underscore ("_") character, to avoid hidden
#          files and confusion with command options.
#      3.  If <path> exists, then it cannot be a symbolic
#          link (although its components may be links).
#      4.  <path> cannot be a subdirectory of the current
#          directory, or vice versa, to avoid overwriting and
#          infinite recursion.
#
# All .html files are processed to expand Server-Side Includes
# (#include directives, or SSIs), by inserting the specified
# file's contents inline.
#
# Bob Carragher
# Sat May  2 12:38:50 PDT 2015

# Determine target copy location.
TARGET_PATH=/tmp/dancebreak_website_$USER
if [ "$#" -eq 1 ]; then
    TARGET_PATH="$1"
    # Check for illegal characters.
    CHECK_PATH=$(echo "$TARGET_PATH" | tr -d A-Za-z0-9/._- | wc -c)
    if [ $CHECK_PATH -ne 1 ]; then
        echo 'Path components may use only the following characters:'
        echo '     ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        echo '     abcdefghijklmnopqrstuvwxyz'
        echo '     0123456789._-'
        echo 'Bye!'
        exit 1
    fi
    # Check for disallowed path components.
    CHECK_PATH=$(echo $TARGET_PATH | sed -e 's;/; ;g' -e 's/\([^ ]\)[^ ]*/\1/g' | tr -d "A-Za-z0-9\ _" | wc -c)
    if [ $CHECK_PATH -ne 1 ]; then
        echo 'Path components must not begin with "." or "-" character.  Bye!'
        exit 1
    fi
    # Check whether it's a symbolic link.
    if [ -L $TARGET_PATH ]; then
        echo 'Path must not be a symbolic link.  Bye!'
        exit 1
    fi
    # Check for directory containment.
    CANONICAL_PWD=$(readlink -f .)
    CANONICAL_TARGET=$(readlink -m $TARGET_PATH)
    if [ "$CANONICAL_TARGET" = "$CANONICAL_PWD" ]; then
        echo 'Copy path and current directory must be different.  Bye!'
        exit 1
    fi
    case "$CANONICAL_TARGET/" in
        "$CANONICAL_PWD/"*)
            echo 'Copy path is not allowed to be a subdirectory of current directory.  Bye!';
            exit 1;
            ;;
    esac
    case "$CANONICAL_PWD/" in
        "$CANONICAL_TARGET/"*)
            echo 'Current directory is not allowed to be a subdirectory of copy path.  Bye!';
            exit 1;
            ;;
    esac
elif [ "$#" -gt 1 ]; then
    echo "Too many paths specified ($#).  Bye!"
    exit 1
fi

# Check whether target path exists or can be created, and is writable.
if [ ! -d $TARGET_PATH ]; then
    if [ -e $TARGET_PATH ]; then
        echo "Target path exists and is not a directory: $TARGET_PATH"
        echo "Bye!"
        exit 1
    fi
    echo "Note:  creating target path: $TARGET_PATH"
    mkdir -p $TARGET_PATH
    if [ ! -d $TARGET_PATH ]; then
        echo "Failed to create target path: $TARGET_PATH"
        echo "Bye!"
        exit 1
    fi
fi
if [ ! -w $TARGET_PATH ]; then
    echo "Cannot write to target path: $TARGET_PATH"
    echo "Bye!"
    exit 1
fi

# Copy the directory tree, overwriting as necessary.
cp -f -R . $TARGET_PATH

# Process HTML files in the copy.
cd $TARGET_PATH
find . -type f -name '*.html' -print0 | while IFS= read -r -d '' ff; do
    CHECK_VIRTUAL=$(grep "#include virtual=" "$ff")
    if [ "$CHECK_VIRTUAL" != "" ]; then
        echo Processing $ff ...
        sed -e '/<!-- *#include virtual="includes\/stdhead.ssi" *-->/r includes/stdhead.ssi' -e '/<!-- *#include virtual="includes\/stdheader.ssi" *-->/r includes/stdheader.ssi' "$ff" > "$ff".tmp
        mv "$ff".tmp "$ff"
    fi
done

exit 0
