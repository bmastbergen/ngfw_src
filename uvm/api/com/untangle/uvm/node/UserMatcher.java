/**
 * $Id$
 */
package com.untangle.uvm.node;

import java.util.LinkedList;

import org.apache.log4j.Logger;

import com.untangle.uvm.UvmContextFactory;

public class UserMatcher
{
    private static final String MARKER_SEPERATOR = ",";
    private static final String MARKER_ANY = "[any]";
    private static final String MARKER_NONE = "[none]";
    private static final String MARKER_UNAUTHENTICATED = "[unauthenticated]";
    private static final String MARKER_AUTHENTICATED = "[authenticated]";

    private static UserMatcher ANY_MATCHER = new UserMatcher(MARKER_ANY);
    
    private final Logger logger = Logger.getLogger(getClass());

    /**
     * This stores the string representation of this matcher
     */
    public String matcher;

    /**
     * This is all the available types of user matchers
     */
    private enum UserMatcherType { ANY, NONE, SINGLE, AUTHENTICATED, UNAUTHENTICATED, LIST };

    /**
     * The type of this matcher
     */
    private UserMatcherType type = UserMatcherType.NONE;
    
    /**
     * This stores the username if this is a single matcher
     */
    public String single = null;

    /**
     * if this port matcher is a list of port matchers, this list stores the children
     */
    private LinkedList<UserMatcher> children = null;
    
    /**
     * Create a user matcher from the given string
     */
    public UserMatcher( String matcher )
    {
        initialize(matcher);
    }
    
    public boolean isMatch( String user )
    {
        switch (this.type) {

        case ANY:
            return true;

        case NONE:
            return false;
            
        case SINGLE:
            if (user == null)
                return false;
            if (user.equalsIgnoreCase(this.single))
                return true;
            return false;
            
        case AUTHENTICATED:
            /* XXX this was kept for backwards compatability */
            return (user != null); 

        case UNAUTHENTICATED:
            /* XXX this was kept for backwards compatability */
            return (user == null); 

        case LIST:
            for (UserMatcher child : this.children) {
                if (child.isMatch(user))
                    return true;
            }
            return false;

        default:
            logger.warn("Unknown port matcher type: " + this.type);
            return false;
            
        }
    }

    /**
     * return string representation
     */
    public String toString()
    {
        return this.matcher;
    }
    
    public static synchronized UserMatcher getAnyMatcher()
    {
        return ANY_MATCHER;
    }

    /**
     * Initialize all the private variables
     */
    private void initialize( String matcher )
    {
        // We used to ';' as a seperator, we now use ','
        matcher = matcher.replaceAll(";",",");
        // only lower case
        matcher = matcher.toLowerCase().trim();
        this.matcher = matcher;

        /**
         * If it contains a comma it must be a list of port matchers
         * if so, go ahead and initialize the children
         */
        if (matcher.contains(MARKER_SEPERATOR)) {
            this.type = UserMatcherType.LIST;

            this.children = new LinkedList<UserMatcher>();

            String[] results = matcher.split(MARKER_SEPERATOR);
            
            /* check each one */
            for (String childString : results) {
                UserMatcher child = new UserMatcher(childString);
                this.children.add(child);
            }

            return;
        }

        /**
         * Check the common constants
         */
        if (MARKER_ANY.equals(matcher))  {
            this.type = UserMatcherType.ANY;
            return;
        }
        if (MARKER_NONE.equals(matcher))  {
            this.type = UserMatcherType.ANY;
            return;
        }
        if (MARKER_AUTHENTICATED.equals(matcher)) {
            this.type = UserMatcherType.UNAUTHENTICATED;
            return;
        }
        if (MARKER_UNAUTHENTICATED.equals(matcher)) {
            this.type = UserMatcherType.UNAUTHENTICATED;
            return;
        }

        /**
         * if it isn't any of these it must be a basic SINGLE matcher
         */
        this.type = UserMatcherType.SINGLE;
        this.single = matcher;

        return;
    }

}
