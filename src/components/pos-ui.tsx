import { Href, Link, usePathname } from 'expo-router';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, useWindowDimensions, View } from 'react-native';

export const palette = {
  canvas: '#f5f5f2',
  surface: '#ffffff',
  surfaceMuted: '#f0eee8',
  ink: '#1b211f',
  muted: '#6d746f',
  line: '#ddd7ce',
  primary: '#d9631e',
  primaryDark: '#a84610',
  secondary: '#173731',
  tertiary: '#d7a954',
  danger: '#b42318',
  success: '#267761',
};

const navItems: { href: Href; label: string; meta: string }[] = [
  { href: '/', label: 'Dashboard', meta: 'Overview' },
  { href: '/pos', label: 'POS', meta: 'Checkout' },
  { href: '/products', label: 'Products', meta: 'Catalog' },
  { href: '/inventory', label: 'Inventory', meta: 'Stock' },
  { href: '/sales-history', label: 'Sales', meta: 'History' },
  { href: '/reports', label: 'Reports', meta: 'Insights' },
  { href: '/settings', label: 'Settings', meta: 'System' },
];

export function Screen({ children }: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  return (
    <View style={styles.appShell}>
      {wide && <Sidebar />}
      <View style={styles.mainPane}>
        {!wide && (
          <View style={styles.mobileTopbar}>
            <MenuButton onPress={() => setMenuOpen(true)} />
            <Text style={styles.mobileBrand}>CashTrack</Text>
          </View>
        )}
        <View style={styles.screen}>{children}</View>
      </View>
      {!wide && menuOpen && (
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerScrim} onPress={() => setMenuOpen(false)} />
          <Sidebar onNavigate={() => setMenuOpen(false)} compactClose={<CloseButton onPress={() => setMenuOpen(false)} />} />
        </View>
      )}
    </View>
  );
}

export function H1({ children }: PropsWithChildren) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: PropsWithChildren) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
}: PropsWithChildren<{ onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'default' | 'compact'; disabled?: boolean }>) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={StyleSheet.flatten([styles.button, styles[size], styles[variant], disabled && styles.disabled])}>
      <Text style={StyleSheet.flatten([styles.buttonText, (variant === 'ghost' || variant === 'secondary') && styles.darkButtonText])}>{children}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor="#8b918d" {...props} style={[styles.field, props.style]} />;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Sidebar({ onNavigate, compactClose }: { onNavigate?: () => void; compactClose?: ReactNode }) {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View>
          <Text style={styles.brand}>CashTrack</Text>
          <Text style={styles.brandMeta}>Mobile POS</Text>
        </View>
        {compactClose}
      </View>
      <ScrollView contentContainerStyle={styles.navList}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(String(item.href)));
          return (
            <Link key={String(item.href)} href={item.href} asChild>
              <Pressable onPress={onNavigate} style={StyleSheet.flatten([styles.navItem, active && styles.navItemActive])}>
                <Text style={StyleSheet.flatten([styles.navLabel, active && styles.navLabelActive])}>{item.label}</Text>
                <Text style={StyleSheet.flatten([styles.navMeta, active && styles.navMetaActive])}>{item.meta}</Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
      <Link href="/login" asChild>
        <Pressable onPress={onNavigate} style={styles.accountLink}>
          <Text style={styles.accountText}>Owner Login</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel="Open menu" style={styles.iconButton}>
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </Pressable>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel="Close menu" style={styles.iconButton}>
      <View style={[styles.closeLine, styles.closeLineA]} />
      <View style={[styles.closeLine, styles.closeLineB]} />
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: palette.canvas, flexDirection: 'row' },
  mainPane: { flex: 1, minWidth: 0 },
  mobileTopbar: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.canvas,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  mobileBrand: { color: palette.ink, fontWeight: '900', fontSize: 16 },
  screen: { flex: 1, backgroundColor: palette.canvas, padding: 16, gap: 14 },
  h1: { fontSize: 30, fontWeight: '900', color: palette.ink, letterSpacing: 0 },
  h2: { fontSize: 18, fontWeight: '800', color: palette.secondary, letterSpacing: 0 },
  body: { fontSize: 14, color: palette.muted, lineHeight: 20 },
  button: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: 'transparent' },
  default: { minHeight: 46 },
  compact: { minHeight: 36, paddingHorizontal: 12 },
  primary: { backgroundColor: palette.primary },
  secondary: { backgroundColor: palette.surfaceMuted, borderColor: palette.line },
  danger: { backgroundColor: palette.danger },
  ghost: { backgroundColor: palette.surface, borderColor: palette.line },
  disabled: { opacity: 0.55 },
  buttonText: { color: 'white', fontWeight: '700' },
  darkButtonText: { color: palette.ink },
  field: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 12,
    color: palette.ink,
  },
  stat: {
    flex: 1,
    minWidth: 145,
    backgroundColor: palette.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    borderLeftWidth: 3,
    borderLeftColor: palette.primary,
  },
  statLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  statValue: { color: palette.ink, fontSize: 20, fontWeight: '900', marginTop: 6 },
  sidebar: {
    width: 252,
    backgroundColor: palette.secondary,
    padding: 16,
    gap: 16,
    borderRightWidth: 1,
    borderRightColor: '#244840',
  },
  sidebarHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { color: '#fffaf2', fontSize: 22, fontWeight: '900', letterSpacing: 0 },
  brandMeta: { color: '#b7c3bd', fontSize: 12, fontWeight: '700', marginTop: 2 },
  navList: { gap: 8, paddingBottom: 12 },
  navItem: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: 'transparent' },
  navItemActive: { backgroundColor: '#fffaf2', borderColor: palette.tertiary },
  navLabel: { color: '#edf4f0', fontWeight: '800', fontSize: 15 },
  navLabelActive: { color: palette.secondary },
  navMeta: { color: '#9db0a9', fontSize: 11, marginTop: 2, fontWeight: '700' },
  navMetaActive: { color: palette.primaryDark },
  accountLink: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#33554d', paddingTop: 14 },
  accountText: { color: palette.tertiary, fontWeight: '800' },
  drawerOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 30, flexDirection: 'row' },
  drawerScrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(18, 25, 22, 0.46)' },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  menuLine: { width: 19, height: 2, borderRadius: 2, backgroundColor: palette.ink },
  closeLine: { position: 'absolute', width: 19, height: 2, borderRadius: 2, backgroundColor: palette.ink },
  closeLineA: { transform: [{ rotate: '45deg' }] },
  closeLineB: { transform: [{ rotate: '-45deg' }] },
});
