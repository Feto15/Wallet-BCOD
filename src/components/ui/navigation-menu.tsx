'use client';

import React, { forwardRef } from 'react';

type ElementProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

const NavigationMenuRoot = forwardRef<HTMLElement, ElementProps<'nav'>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={className} {...props} />
  )
);
NavigationMenuRoot.displayName = 'NavigationMenuRoot';

const NavigationMenuList = forwardRef<HTMLDivElement, ElementProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} role="menubar" {...props} />
  )
);
NavigationMenuList.displayName = 'NavigationMenuList';

const NavigationMenuItem = forwardRef<HTMLDivElement, ElementProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} role="none" {...props} />
  )
);
NavigationMenuItem.displayName = 'NavigationMenuItem';

interface NavigationMenuLinkProps extends ElementProps<'a'> {
  asChild?: boolean;
}

const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const childClassName = (child.props as { className?: string }).className ?? '';
      const mergedClassName = [childClassName, className].filter(Boolean).join(' ') || undefined;

      return React.cloneElement(child, {
        ...props,
        className: mergedClassName,
        ref,
      });
    }

    return (
      <a ref={ref} className={className} {...props}>
        {children}
      </a>
    );
  }
);
NavigationMenuLink.displayName = 'NavigationMenuLink';

const NavigationMenuViewport = forwardRef<HTMLDivElement, ElementProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);
NavigationMenuViewport.displayName = 'NavigationMenuViewport';

const NavigationMenu = {
  Root: NavigationMenuRoot,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Link: NavigationMenuLink,
  Viewport: NavigationMenuViewport,
};

export default NavigationMenu;
export {
  NavigationMenuRoot as Root,
  NavigationMenuList as List,
  NavigationMenuItem as Item,
  NavigationMenuLink as Link,
  NavigationMenuViewport as Viewport,
};
