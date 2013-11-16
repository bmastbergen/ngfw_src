/*
 * $HeadURL$
 * Copyright (c) 2003-2007 Untangle, Inc. 
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * AS-IS and WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE, TITLE, or
 * NONINFRINGEMENT.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#include <stdlib.h>

#include <mvutil/debug.h>
#include <mvutil/errlog.h>

#include "netcap_trie.h"
#include "netcap_trie_support.h"

void*                netcap_trie_item_data ( netcap_trie_item_t* item )
{
    if ( item == NULL ) return errlogargs_null();

    return item->data;
    
}

netcap_trie_item_t*  netcap_trie_item_malloc   ( netcap_trie_t* trie )
{
    netcap_trie_item_t* item;

    if (( item = malloc( sizeof(netcap_trie_item_t))) == NULL ) return errlogmalloc_null();

    return item;
}

int                  netcap_trie_item_init     ( netcap_trie_t* trie, netcap_trie_item_t* item,
                                                 netcap_trie_level_t* parent, u_char pos, u_char depth )
{
    if ( item == NULL || trie == NULL ) return errlogargs();
    
    bzero( item, sizeof(netcap_trie_item_t));
    
    /* Initialize the base */
    if ( netcap_trie_base_init( trie, item, parent, NC_TRIE_BASE_ITEM, pos, depth ) < 0 ) {
        return errlog(ERR_CRITICAL, "netcap_trie_base_init\n");
    }
   
    return 0;
}

netcap_trie_item_t*  netcap_trie_item_create   ( netcap_trie_t* trie, netcap_trie_level_t* parent,
                                                 u_char pos, u_char depth )
{
    netcap_trie_item_t* item;
    
    if ( ( item = netcap_trie_item_malloc( trie ) ) == NULL ) {
        return errlog_null(ERR_CRITICAL,"netcap_trie_item_malloc");
    }
    
    if ( netcap_trie_item_init( trie, item, parent, pos, depth ) < 0 ) {
        netcap_trie_item_free( trie, item );
        return errlog_null(ERR_CRITICAL,"netcap_trie_item_init");
    }
    
    return item;
}
 
void                 netcap_trie_item_free     ( netcap_trie_t* trie, netcap_trie_item_t* item )
{
    if ( trie == NULL || item == NULL ) return (void)errlogargs();

    if ( item->type != NC_TRIE_BASE_ITEM ) {
        errlog(ERR_CRITICAL,"TRIE: Freeing a non-item as an item\n");
    }
    
    free(item);
}

void                 netcap_trie_item_destroy  ( netcap_trie_t* trie, netcap_trie_item_t* item )
{
    if ( trie == NULL || item == NULL ) return (void)errlogargs();

    if ( item->type != NC_TRIE_BASE_ITEM ) {
        return (void)errlog(ERR_CRITICAL,"TRIE: Destroying a non-item as an item\n");
    }

    /* Clear out the parent */
    item->parent = NULL;
    
    /* Destroy the base */
    netcap_trie_base_destroy ( trie, item );
}

void                 netcap_trie_item_raze     ( netcap_trie_t* trie, netcap_trie_item_t* item )
{
    if ( trie == NULL || item == NULL ) return (void)errlogargs();

    if ( item->type != NC_TRIE_BASE_ITEM ) {
        return (void)errlog(ERR_CRITICAL,"TRIE: Razing a non-item as an item\n");
    }

    netcap_trie_item_destroy ( trie, item );

    netcap_trie_item_free( trie, item );
}
