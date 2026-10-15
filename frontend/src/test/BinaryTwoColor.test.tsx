import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BinaryTwoColor, splitBinaryByPrefix } from '../components/BinaryTwoColor';

describe('Komponen BinaryTwoColor', () => {
  it('fungsi splitBinaryByPrefix memisahkan bit jaringan dan bit host dengan benar untuk /27', () => {
    const ipBiner = '11000000.10101000.00000000.00000101';
    const { netPart, hostPart } = splitBinaryByPrefix(ipBiner, 27);

    // 27 bit pertama (termasuk 3 titik) adalah network part
    expect(netPart).toBe('11000000.10101000.00000000.000');
    // 5 bit terakhir adalah host part
    expect(hostPart).toBe('00101');
  });

  it('fungsi splitBinaryByPrefix menangani prefix 0 dan 32', () => {
    const maskBiner = '11111111.11111111.11111111.11111111';
    const split32 = splitBinaryByPrefix(maskBiner, 32);
    expect(split32.netPart).toBe(maskBiner);
    expect(split32.hostPart).toBe('');

    const split0 = splitBinaryByPrefix(maskBiner, 0);
    expect(split0.netPart).toBe('');
    expect(split0.hostPart).toBe(maskBiner);
  });

  it('merender legenda dan membedakan warna latar bit jaringan dan bit host', () => {
    render(
      <BinaryTwoColor
        ipBiner="11000000.10101000.00000000.00000101"
        maskBiner="11111111.11111111.11111111.11100000"
        prefix={27}
        ipDesimal="192.168.0.5"
        maskDesimal="255.255.255.224"
      />
    );

    // Legenda
    expect(screen.getByText(/Bit Jaringan \(Network: 27 bit\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bit Host \(Host: 5 bit\)/i)).toBeInTheDocument();

    // Nilai desimal
    expect(screen.getByText('(192.168.0.5)')).toBeInTheDocument();
    expect(screen.getByText('(255.255.255.224)')).toBeInTheDocument();
  });
});
